 function playAppSound(type) {
    // Luôn mặc định là Bật nếu user chưa từng tắt (!== 'false')
    const isSoundEnabled = localStorage.getItem('app_sound') !== 'false';
    if (!isSoundEnabled) return;

    let soundPath = '';

    switch(type) {
        case 'income':
            soundPath = 'assets/sounds/freesound_community-news-ting-6832.mp3'; 
            break;
        case 'expense':
            soundPath = 'assets/sounds/whoosh.mp3';  
            break;
        case 'delete':
            soundPath = 'assets/sounds/trash.mp3';   
            break;
        case 'notify':
            soundPath = 'assets/sounds/dragon-studio-new-notification-3-398649.mp3';     
            break;
        default:
            soundPath = 'assets/sounds/success.mp3'; 
    }

    const audio = new Audio(soundPath);
    audio.play().catch(err => console.log("Audio playback error:", err));
}