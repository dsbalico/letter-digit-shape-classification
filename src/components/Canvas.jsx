import React, { useEffect, useRef } from 'react';
import { BiReset } from 'react-icons/bi';

// Constants for the canvas size, brush size, and points distance.
const CANVAS_WIDTH = 185;
const CANVAS_HEIGHT = 185;
const POINTS_DISTANCE = 5;

// Canvas component.
function Canvas({ canvasRef, brushSize }) {
    // Use useRef to manage stateful values that won't cause re-renders.
    const isDrawing = useRef(false); // Tracks whether the user is currently drawing.
    const lines = useRef([]); // Holds the drawing lines.
    const drawTimeoutRef = useRef(null); // Used to throttle the drawing function.

    // useEffect with an empty dependency array to run the initialization logic once.
    useEffect(() => {
        // Initialize the canvas and set up basic drawing settings.
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = brushSize * 2;

        // Function to handle the 'R' key press to clear the canvas.
        const handleKeyDown = (event) => {
            if (event.key === 'r' || event.key === 'R') {
                clearCanvas();
            }
        };

        // Add event listener for keydown, remove it when the component is unmounted.
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Function to clear the canvas.
    const clearCanvas = () => {
        lines.current = [];
        const canvas = canvasRef.current;
        const ctx = getCanvasContext(canvas);
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    };

    // Utility function to get the 2D context of the canvas.
    const getCanvasContext = (canvas) => {
        return canvas.getContext('2d');
    };

    // Utility function to get the bounding rectangle of the canvas.
    const getCanvasRect = (canvas) => {
        return canvas.getBoundingClientRect();
    };

    // Function to start the drawing process.
    const startDrawing = (event) => {
        event.preventDefault();
        isDrawing.current = true;

        // Get the canvas, its context, and the initial drawing coordinates.
        const canvas = canvasRef.current;
        const ctx = getCanvasContext(canvas);
        const { clientX, clientY } = getEventCoordinates(event);
        const rect = getCanvasRect(canvas);
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Add the initial point to the lines array and draw a small circle at that point.
        lines.current.push({ points: [{ x, y }] });
        ctx.beginPath();
        ctx.arc(x, y, brushSize, 0, 2 * Math.PI);
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.beginPath();

        // Add the initial point to the lines array along with the current brush size.
        lines.current.push({ points: [{ x, y }], brushSize: brushSize });
    };

    // Function to handle the drawing process.
    const draw = (event) => {
        event.preventDefault();

        // If not currently drawing, return early.
        if (!isDrawing.current) return;

        // Get the canvas, its context, and the current drawing coordinates.
        const canvas = canvasRef.current;
        const { clientX, clientY } = getEventCoordinates(event);
        const rect = getCanvasRect(canvas);
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Get the last line and point to check the distance between the current and last points.
        const lastLine = lines.current[lines.current.length - 1];
        const lastPoint = lastLine.points[lastLine.points.length - 1];
        const distance = Math.sqrt(Math.pow(x - lastPoint.x, 2) + Math.pow(y - lastPoint.y, 2));

        // If the distance is greater than or equal to the specified POINTS_DISTANCE, add the point to the line.
        if (distance >= POINTS_DISTANCE) {
            lastLine.points.push({ x, y });

            // Throttle the draw function using requestAnimationFrame.
            if (!drawTimeoutRef.current) {
                drawTimeoutRef.current = requestAnimationFrame(() => {
                    drawTimeoutRef.current = null;
                    drawOnMainCanvas();
                });
            }
        }
    };

    // Function to draw the lines on the main canvas.
    const drawOnMainCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = getCanvasContext(canvas);

        // Clear the canvas with white color.
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Iterate through the lines and draw them based on the number of points.
        lines.current.forEach((line) => {
            const points = line.points;
            ctx.lineWidth = line.brushSize * 2; // Set the brush size for the current line.

            if (points.length > 2) {
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);

                for (let i = 1; i < points.length - 1; i++) {
                    const xc = (points[i].x + points[i + 1].x) / 2;
                    const yc = (points[i].y + points[i + 1].y) / 2;
                    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
                }

                // Connect the last two points with a straight line.
                ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
                ctx.stroke();
            } else if (points.length === 2) {
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                ctx.lineTo(points[1].x, points[1].y);
                ctx.stroke();
            }
        });
    }

    // Function to end the drawing process.
    const endDrawing = () => {
        isDrawing.current = false;
    };

    // Utility function to get the coordinates of the event (mouse or touch).
    const getEventCoordinates = (event) => {
        return event.touches ? event.touches[0] : event;
    };

    // Render the canvas and reset button.
    return (
        <div style={{ position: 'relative' }}>
            <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="border border-gray-500 rounded-lg"
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={endDrawing}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseOut={endDrawing}
            ></canvas>
            <button style={{ position: 'absolute', top: 5, right: 5 }} onClick={clearCanvas}>
                <BiReset className='text-blue-700 hover:scale-105 transition-all' />
            </button>
        </div>
    );
}

// Export the Canvas component as the default export.
export default Canvas;
