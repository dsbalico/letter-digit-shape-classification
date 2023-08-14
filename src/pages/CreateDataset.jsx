import React, { useRef, useState } from 'react';
import Toast from '../components/Toast';
import CanvasInteraction from '../components/CanvasInteraction';
import { IoCreate } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

function CreateDataset() {
    const canvasRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [filename, setFilename] = useState('filename');

    // Function to save the canvas as a JPG image
    const saveCanvasAsImage = () => {
        if (!canvasRef.current) {
            console.error("Canvas reference is not available.");
            return;
        }

        const canvas = canvasRef.current;
        const link = document.createElement("a");

        // Convert the canvas content to a data URL
        const image = canvas.toDataURL("image/jpeg");

        // Set the data URL as the link's href and download the image
        link.href = image;
        link.download = `${filename}.jpg`;
        link.click();
    };

    return (
        <div className='bg-stripes h-screen'>
            {/* Page Title */}
            <h1 className='flex gap-1 justify-center text-4xl font-thin tracking-wide text-center pt-6 text-gray-500 uppercase'>
                <IoCreate className='self-center text-5xl' />
                <span className='self-center'>Create Dataset</span>
            </h1>

            {/* Toast Notification */}
            <div className='absolute flex w-full top-24 justify-center mx-auto'>
                <Toast />
            </div>

            {/* Canvas Interaction Section */}
            <div className='h-[85vh] flex flex-wrap justify-center content-center'>
                <div className='bg-white py-6 px-4 lg:px-6 rounded-md shadow-md mx-2'>
                    <CanvasInteraction
                        key={1}
                        title={"Draw Anything"}
                        description={"Draw anything you want to save as an image."}
                        isLoading={isLoading}
                        canvasRef={canvasRef}
                        classify={false}
                        submitFunction={saveCanvasAsImage}
                        filename={filename}
                        setFilename={setFilename}
                    />
                </div>

                {/* Navigation Button */}
                <button onClick={() => navigate('/')} className='mt-2 w-full text-blue-700 underline hover:text-blue-600'>
                    Back to Model Testing
                </button>
            </div>
        </div>
    );
}

export default CreateDataset;
