// JSON Configuration
const displayConfig = {
    "schedules": [
        {
            "startTime": "09:00",
            "endTime": "16:00",
            "images": {
                "horizontal": "assets/Combo 2 presas base horizontal.png",
                "vertical": "assets/Combo 2 presas base vertical.png"
            }
        },
        {
            "startTime": "16:00",
            "endTime": "21:00",
            "images": {
                "horizontal": "assets/Gus box base horizontal.png",
                "vertical": "assets/Gus box base vertical.png"
            }
        }
    ]
};

const timeDisplay = document.getElementById('timeDisplay');
let currentActiveSchedule = null;
let currentOrientation = null;

// Parse "HH:mm" into minutes from start of day
function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

function updateTimeAndDisplays() {
    const now = new Date();
    
    // Format 12-hour time and determine AM/PM
    const rawHours = now.getHours();
    const isPM = rawHours >= 12;
    const amPm = isPM ? 'PM' : 'AM';
    
    let displayHours = rawHours % 12;
    displayHours = displayHours ? displayHours : 12; // 0 becomes 12

    const hours = String(displayHours).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    timeDisplay.innerHTML = `<span class="am-pm">${amPm}</span><span class="time-main">${hours}:${minutes}</span>`;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let activeSchedule = null;
    for (const schedule of displayConfig.schedules) {
        const startMins = timeToMinutes(schedule.startTime);
        const endMins = timeToMinutes(schedule.endTime);

        if (currentMinutes >= startMins && currentMinutes < endMins) {
            activeSchedule = schedule;
            break;
        }
    }
    
    // Detect orientation (or force via URL ?pantalla=vertical o ?pantalla=horizontal)
    const urlParams = new URLSearchParams(window.location.search);
    let isVertical = window.innerHeight > window.innerWidth || window.innerHeight === 810;
    
    if (urlParams.get('pantalla') === 'vertical') {
        isVertical = true;
    } else if (urlParams.get('pantalla') === 'horizontal') {
        isVertical = false;
    }

    const newOrientation = isVertical ? 'vertical' : 'horizontal';

    if (!activeSchedule && displayConfig.schedules.length > 0) {
        // Fallback al primer horario si está fuera de todo horario para que NUNCA se oculte
        activeSchedule = displayConfig.schedules[0];
    }

    // Update if schedule or orientation changed
    if (activeSchedule !== currentActiveSchedule || newOrientation !== currentOrientation) {
        currentActiveSchedule = activeSchedule;
        currentOrientation = newOrientation;

        // Apply orientation classes
        if (isVertical) {
            document.body.classList.remove('display-horizontal');
            document.body.classList.add('display-vertical');
        } else {
            document.body.classList.remove('display-vertical');
            document.body.classList.add('display-horizontal');
        }

        const bgImage = document.getElementById('bgImage');
        if (activeSchedule) {
            const imgUrl = isVertical ? activeSchedule.images.vertical : activeSchedule.images.horizontal;
            bgImage.src = encodeURI(imgUrl);
            bgImage.style.display = 'block';
        }
    }
}

// Check if window resize changes the orientation
window.addEventListener('resize', () => {
    updateTimeAndDisplays();
});

setInterval(updateTimeAndDisplays, 1000);
updateTimeAndDisplays();
