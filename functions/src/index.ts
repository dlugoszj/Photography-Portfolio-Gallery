
import {setGlobalOptions} from "firebase-functions";
setGlobalOptions({ maxInstances: 10, memory: "1GiB", });
import * as functions from "firebase-functions/v2"; 
import admin from "firebase-admin"; 
import sharp from "sharp";
import heicConvert from "heic-convert";
import { fileTypeFromBuffer } from "file-type";


admin.initializeApp();
// Function that is given a document from Firebase deletes it and recursively
// deletes any sub-documents of the parent document.
export const deleteDocumentsRecursively = functions.https
    .onCall(async (request: functions.https.CallableRequest) => { 
    
    // Check that the user is authenticated 
    if (!request || !request.auth) { 
        throw new functions.https.HttpsError("unauthenticated", "Must be logged in"); 
    } 
    console.log("Deleting " + request.data.path); 

    // Get reference to document from path that was passed in.
    const ref = admin.firestore().doc(request.data.path); 

    // Recursive delete
    await admin.firestore().recursiveDelete(ref);

    // Delete original parent document
    await ref.delete();
});

// Function that compresses/resizes an image when it is uploaded to Firestore
export const processImage =  functions.https.onCall(async (request: functions.https.CallableRequest) => { 
    // Check that the user is authenticated 
    if (!request || !request.auth) { 
        throw new functions.https.HttpsError("unauthenticated", "Must be logged in"); 
    } 
    const filePath = request.data.filePath;
 
    // If an image in an album is uploaded
    if (filePath.includes("/images/") ){
        await resizeHelper(filePath, 700, "_700x700");
        let [image2000Height, image2000Width] = await resizeHelper(filePath, 2000, "_2000x2000");

        const documentRef = admin.firestore().doc(filePath);
        documentRef.set({
            imageURL: filePath,
            fullSizedImageURL:filePath + "_2000x2000" , 
            thumbnailURL:filePath + "_700x700", 
            height: image2000Height, 
            width: image2000Width 
        })
        await admin.storage().bucket().file(filePath).delete();
    }
    // If an album/category cover photo is uploaded
    else if(filePath.includes("/cover")){
        // If a cover image is being changed, there is no original 
        // cover image to delete. Additionally nothing needs to be
        // appended to the filepath since it is already changed.
        if(filePath.includes("/cover_resized")){
            await resizeHelper(filePath, 700, "");

        }
        else{
            await resizeHelper(filePath, 700, "_resized");
            await admin.storage().bucket().file(filePath).delete();


        }
        const documentRef = admin.firestore().doc(filePath.substring(0, filePath.lastIndexOf("/")));

        // If album description or album title are empty this album/category was called by 
        // handleUpdate in utils which just is uploading an image nothing more. If this
        // is called by handleSaveAlbum then it has to have album title and description.
        if (request.data.albumDescription == "" || request.data.albumTitle == ""){
            documentRef.update({updatedAt: Date.now()})
        }
        else{
            documentRef.set({
                coverImageUrl: filePath + "_resized",
                description: request.data.albumDescription,
                title: request.data.albumTitle,
                id: request.data.docRef,
                updatedAt: Date.now()
            })        
        }

    }
});


// Function that converts HEIC/HEIF images to JPEG, resizes, and compresses them
async function resizeHelper (filePath: string, maxPixelDimension: number, filePathAppendage: string ) {
    const bucket = admin.storage().bucket();
    let [fileBuffer] = await bucket.file(filePath).download();
    const fileType = await fileTypeFromBuffer(fileBuffer);

    // Converts HEIC/HEIF images to JPEG
    if (fileType && (fileType.mime == "image/heic" || fileType.mime == "image/heif" )){
        console.log("Detected HEIC Image, converting it to JPEG");
        fileBuffer = await heicConvert({
            buffer: fileBuffer,
            format: "JPEG",
            quality: 1
        });    
    }

    // Resizes images to desired dimension and compresses to 80% quality
    const resizedFileBuffer = await sharp(fileBuffer).resize(
        {height:maxPixelDimension, 
            width:maxPixelDimension, 
            fit: sharp.fit.inside, 
            withoutEnlargement:true})
            .jpeg({quality:80})
            .toBuffer();
    
    // Get the new dimensions of the image
    const metadata = await sharp(resizedFileBuffer).metadata();
    
    // Upload the resized image back to Firestore
    const file = bucket.file(filePath + filePathAppendage);
    await file.save(resizedFileBuffer, { contentType: "image/jpeg" });

    return [metadata.height, metadata.width];
}