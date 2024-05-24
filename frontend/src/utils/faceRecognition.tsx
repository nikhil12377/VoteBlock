import {
    bufferToImage,
    detectAllFaces,
    euclideanDistance,
} from "face-api.js";

export function dataURLtoFile(dataurl: string, filename: string) {
    const arr = dataurl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);

    if (!mimeMatch) {
        throw new Error("Invalid data URL format");
    }

    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
}

export async function start(image1: HTMLImageElement) {
    let descriptor1, descriptor2;
    let faceMatched = false;

    try {
        descriptor1 = await detectAllFaces(image1)
            .withFaceLandmarks()
            .withFaceDescriptors();
        console.log("descriptor1", descriptor1[0]);

        const regFaceSrc = localStorage.getItem("file");
        const regFace = dataURLtoFile(JSON.parse(regFaceSrc as string), "regFace");
        const image2 = await bufferToImage(regFace);
        descriptor2 = await detectAllFaces(image2)
            .withFaceLandmarks()
            .withFaceDescriptors();
        console.log("descriptor2", descriptor2[0]);
        const distance = euclideanDistance(
            descriptor1[0].descriptor,
            descriptor2[0].descriptor
        );
        console.log(distance);
        if (distance < 0.4) {
            faceMatched = true;
            console.log(true);
        } else {
            faceMatched = false;
            console.log(false);
        }
    } catch (error) {
        faceMatched = false;
        console.log(error);
    }

    return faceMatched;
}
