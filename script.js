// Default configuration
let config = {
    backgroundImage: 'assets/background.jpg',
    successBackgroundImage: 'assets/success-background.jpg',
    noBackgroundImages: [],
    sadImages: [
        'assets/sad-cat-1.gif',
        'assets/sad-cat-2.gif',
        'assets/sad-cat-3.gif',
        'assets/sad-cat-4.gif',
        'assets/sad-cat-5.gif'
    ],
    noSounds: [
        'assets/sound-no-1.mp3',
        'assets/sound-no-2.mp3',
        'assets/sound-no-3.mp3',
        'assets/sound-no-4.mp3',
        'assets/sound-no-5.mp3'
    ],
    yesSound: 'assets/sound-yes.mp3',
    guiltMessages: [
        "Oh no... 😢",
        "But... but why? 🥺",
        "You're breaking my heart... 💔",
        "Even the cats are crying now... 😿",
        "Please reconsider... 🙏",
        "The universe is sad... 🌌💔",
        "My heart can't take this... 😭",
        "One more chance? 🥹"
    ]
};

// Load config from external file if available
fetch('config.json')
    .then(response => response.json())
    .then(data => {
        config = { ...config, ...data };
        updateBackgroundImages();
    })
    .catch(() => {
        console.log('Using default config');
        updateBackgroundImages();
    });

function updateBackgroundImages() {
    const defaultBackground = config.backgroundImage || '';
    const successBackground = config.successBackgroundImage || defaultBackground;

    document.documentElement.style.setProperty('--active-bg-image', `url('${defaultBackground}')`);
    document.documentElement.style.setProperty('--success-bg-image', `url('${successBackground}')`);
}

function updateNoBackgroundImage() {
    if (!Array.isArray(config.noBackgroundImages) || config.noBackgroundImages.length === 0) {
        return;
    }

    const bgIndex = Math.min(noClickCount - 1, config.noBackgroundImages.length - 1);
    const selectedNoBackground = config.noBackgroundImages[bgIndex] || config.backgroundImage;
    document.documentElement.style.setProperty('--active-bg-image', `url('${selectedNoBackground}')`);
}

const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const guiltImages = document.getElementById('guiltImages');
const guiltMessage = document.getElementById('guiltMessage');
const mainContent = document.getElementById('mainContent');
const successMessage = document.getElementById('successMessage');

let noClickCount = 0;
let currentNoScale = 1;
let currentAudio = null;

function playSingleAudio(source) {
    if (!source) {
        return;
    }

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    currentAudio = new Audio(source);
    currentAudio.play().catch(err => console.log('Audio play failed:', err));
}

// Yes button is static - just click to accept
yesBtn.addEventListener('click', handleYesClick);

// No button mechanics - moves on click
noBtn.addEventListener('click', handleNoClick);

function moveNoButton() {
    const container = document.querySelector('.button-container');
    const containerRect = container.getBoundingClientRect();
    
    const maxX = containerRect.width - noBtn.offsetWidth - 20;
    const maxY = containerRect.height - noBtn.offsetHeight - 20;
    
    const randomX = 20 + Math.random() * maxX;
    const randomY = 20 + Math.random() * maxY;
    
    noBtn.style.left = randomX + 'px';
    noBtn.style.top = randomY + 'px';
}

function handleYesClick(e) {
    e.preventDefault();
    e.stopPropagation();

    // Play yes sound
    playSingleAudio(config.yesSound);
    
    // Hide main content and show success
    mainContent.style.display = 'none';
    successMessage.classList.add('show');
    document.body.classList.add('success');
    
    // Create confetti
    createConfetti();
    
    // Create floating hearts
    setInterval(createHeart, 300);
}

function handleNoClick(e) {
    e.preventDefault();
    noClickCount++;

    updateNoBackgroundImage();
    
    // Play specific no sound based on click count
    const soundIndex = Math.min(noClickCount - 1, config.noSounds.length - 1);
    playSingleAudio(config.noSounds[soundIndex]);
    
    // Replace with latest sad image
    if (Array.isArray(config.sadImages) && config.sadImages.length > 0) {
        const imageIndex = Math.min(noClickCount - 1, config.sadImages.length - 1);
        const img = document.createElement('img');
        img.src = config.sadImages[imageIndex];
        img.className = 'guilt-image';
        img.alt = 'Sad cat';
        guiltImages.innerHTML = '';
        guiltImages.appendChild(img);
    }
    
    // Show guilt message
    const messageIndex = Math.min(noClickCount - 1, config.guiltMessages.length - 1);
    const fallbackMessage = 'Please reconsider... 🙏';
    guiltMessage.textContent = config.guiltMessages[messageIndex] || fallbackMessage;
    
    // Shrink the No button progressively (20% smaller each time)
    currentNoScale -= 0.2;
    
    // After 5 clicks, make the button disappear completely
    if (noClickCount >= 5) {
        noBtn.style.opacity = '0';
        noBtn.style.pointerEvents = 'none';
        noBtn.style.transform = 'translate(-50%, -50%) scale(0)';
    } else {
        // Move the button to a new random position
        moveNoButton();
        // Apply the new scale
        noBtn.style.transform = `translate(-50%, -50%) scale(${currentNoScale})`;
    }
    
    // Shake the container
    document.querySelector('.container').style.animation = 'shake 0.5s ease';
    setTimeout(() => {
        document.querySelector('.container').style.animation = '';
    }, 500);
}

function createConfetti() {
    const colors = ['#ff6b6b', '#ee5a6f', '#ff8787', '#ffa8a8', '#ffc9c9'];
    
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animation = `confettiFall ${2 + Math.random() * 2}s linear`;
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 4000);
        }, i * 30);
    }
}

function createHeart() {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.textContent = ['💕', '💖', '💗', '💝', '💘'][Math.floor(Math.random() * 5)];
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = (2 + Math.random() * 3) + 's';
    document.body.appendChild(heart);
    
    setTimeout(() => heart.remove(), 3000);
}

// Initial positions are set in CSS
window.addEventListener('load', () => {
    // Positions already set: Yes at 35%, No at 65%
});
