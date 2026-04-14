import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";

export class DownloadBarcodeAPI {
    static async downloadBarcodeImage(url: string): Promise<Blob> {
        try {
            // Step 1: Get the HTML response to extract the actual image URL
            const htmlResponse = await axiosInstance.post(
                `/image/download`,
                { url: url }
            );

            // Step 2: Parse HTML to find the image src
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlResponse.data, 'text/html');
            const imgElement = doc.querySelector('img');

            if (!imgElement || !imgElement.src) {
                throw new Error('Image not found in response');
            }

            const imageUrl = imgElement.src;

            // Step 3: Fetch the actual image as blob
            const imageResponse = await fetch(imageUrl);

            if (!imageResponse.ok) {
                throw new Error('Failed to fetch image');
            }

            const blob = await imageResponse.blob();
            return blob;
        } catch (error) {
            toast.error('Failed to download barcode image');
            throw new Error(`Failed to fetch barcode image: ${error}`);
        }
    }
}