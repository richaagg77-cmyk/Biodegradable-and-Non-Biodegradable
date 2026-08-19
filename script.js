// =====================================================
// TEACHABLE MACHINE WASTE CLASSIFIER
// =====================================================

// Your Teachable Machine files
const MODEL_URL = "./model.json";
const METADATA_URL = "./metadata.json";

let model;

// HTML elements
const imageUpload = document.getElementById("imageUpload");

const uploadedImage =
    document.getElementById("uploadedImage");

const camera =
    document.getElementById("camera");

const cameraBtn =
    document.getElementById("cameraBtn");

const predictBtn =
    document.getElementById("predictBtn");

const placeholder =
    document.getElementById("placeholder");

const prediction =
    document.getElementById("prediction");

const loading =
    document.getElementById("loading");

const advice =
    document.getElementById("advice");


// =====================================================
// LOAD MODEL
// =====================================================

async function loadModel() {

    try {

        loading.innerText =
            "🤖 Loading AI model...";

        model = await tmImage.load(
            MODEL_URL,
            METADATA_URL
        );

        loading.innerText =
            "✅ AI model loaded successfully!";

        console.log("Model loaded!");

        console.log(
            "Classes:",
            model.getClassLabels()
        );

    } catch (error) {

        console.error(error);

        loading.innerText =
            "❌ Could not load the AI model.";

        alert(
            "Model could not be loaded. " +
            "Make sure model.json, weights.bin and metadata.json " +
            "are in the same folder."
        );
    }
}


// =====================================================
// IMAGE UPLOAD
// =====================================================

imageUpload.addEventListener(
    "change",
    function(event) {

        const file =
            event.target.files[0];

        if (!file) {
            return;
        }

        // Stop camera if running
        stopCamera();

        const imageURL =
            URL.createObjectURL(file);

        uploadedImage.src =
            imageURL;

        uploadedImage.style.display =
            "block";

        camera.style.display =
            "none";

        placeholder.style.display =
            "none";

        prediction.innerHTML =
            "Image uploaded! Click <b>Classify Waste</b>.";

        advice.style.display =
            "none";
    }
);


// =====================================================
// PREDICT IMAGE
// =====================================================

predictBtn.addEventListener(
    "click",
    async function() {

        if (!model) {

            alert(
                "Please wait for the AI model to finish loading."
            );

            return;
        }

        if (
            uploadedImage.style.display === "none" ||
            !uploadedImage.src
        ) {

            alert(
                "Please upload an image first."
            );

            return;
        }

        await classifyImage(
            uploadedImage
        );
    }
);


// =====================================================
// CLASSIFY IMAGE
// =====================================================

async function classifyImage(image) {

    prediction.innerHTML =
        "🔄 AI is analyzing the image...";

    try {

        const results =
            await model.predict(image);

        // Sort from highest probability to lowest
        results.sort(
            (a, b) =>
                a.probability -
                b.probability
        );

        displayResults(results);

    } catch (error) {

        console.error(error);

        prediction.innerHTML =
            "❌ Something went wrong while classifying the image.";
    }
}


// =====================================================
// DISPLAY RESULTS
// =====================================================

function displayResults(results) {

    prediction.innerHTML = "";

    results.forEach(function(result) {

        const percentage =
            result.probability * 100;

        const item =
            document.createElement("div");

        item.className =
            "prediction-item";

        item.innerHTML = `

            <div class="prediction-header">

                <span>
                    ${result.className}
                </span>

                <span>
                    ${percentage.toFixed(1)}%
                </span>

            </div>

            <div class="bar">

                <div
                    class="bar-fill"
                    style="width: ${percentage}%"
                ></div>

            </div>
        `;

        prediction.appendChild(item);

    });


    // Highest prediction
    const best =
        results[0];

    const confidence =
        best.probability * 100;


    showAdvice(
        best.className,
        confidence
    );
}


// =====================================================
// SHOW WASTE ADVICE
// =====================================================

function showAdvice(
    className,
    confidence
) {

    advice.style.display =
        "block";


    if (confidence < 60) {

        advice.innerHTML = `
            ⚠️ <strong>Low confidence</strong><br>
            Try taking a clearer photo with the
            waste item centered and well lit.
        `;

        return;
    }


    if (
        className
            .toLowerCase()
            .includes("non-bio")
    ) {

        advice.innerHTML = `
            ♻️ <strong>Non-Bio-Degradable Waste</strong><br><br>

            This type of waste does not break down
            naturally very easily. It should be placed
            in the appropriate non-biodegradable or
            recyclable waste stream.
        `;

    } else {

        advice.innerHTML = `
            🌱 <strong>Bio-Degradable Waste</strong><br><br>

            This type of waste can naturally decompose.
            Organic waste can often be separated for
            composting or suitable organic-waste processing.
        `;
    }
}


// =====================================================
// CAMERA
// =====================================================

let cameraStream = null;

cameraBtn.addEventListener(
    "click",
    async function() {

        if (!model) {

            alert(
                "Please wait for the AI model to load."
            );

            return;
        }


        try {

            cameraStream =
                await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false
                });


            camera.srcObject =
                cameraStream;


            camera.style.display =
                "block";

            uploadedImage.style.display =
                "none";

            placeholder.style.display =
                "none";


            cameraBtn.innerText =
                "📸 Classify Camera Image";


            cameraBtn.onclick =
                classifyCamera;

        } catch (error) {

            console.error(error);

            alert(
                "Could not access the camera. " +
                "Please allow camera permission."
            );
        }
    }
);


// =====================================================
// CLASSIFY CAMERA IMAGE
// =====================================================

async function classifyCamera() {

    if (!model) {
        return;
    }


    prediction.innerHTML =
        "🔄 AI is analyzing the camera image...";


    try {

        const results =
            await model.predict(camera);


        results.sort(
            (a, b) =>
                b.probability -
                a.probability
        );


        displayResults(results);

    } catch (error) {

        console.error(error);

        prediction.innerHTML =
            "❌ Could not classify the camera image.";
    }
}


// =====================================================
// STOP CAMERA
// =====================================================

function stopCamera() {

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(
                track => track.stop()
            );

        cameraStream = null;

    }

    camera.srcObject = null;

    camera.style.display =
        "none";

    cameraBtn.innerText =
        "🎥 Use Camera";

    cameraBtn.onclick =
        startCamera;
}


// =====================================================
// START CAMERA AGAIN
// =====================================================

async function startCamera() {

    if (!model) {
        return;
    }


    try {

        cameraStream =
            await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });


        camera.srcObject =
            cameraStream;

        camera.style.display =
            "block";

        uploadedImage.style.display =
            "none";

        placeholder.style.display =
            "none";

        cameraBtn.innerText =
            "📸 Classify Camera Image";

        cameraBtn.onclick =
            classifyCamera;

    } catch (error) {

        console.error(error);

        alert(
            "Camera permission was denied."
        );
    }
}


// =====================================================
// START EVERYTHING
// =====================================================

loadModel();
