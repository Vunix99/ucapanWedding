// Di asset/js/flower.js (atau script.js jika tidak ada flower.js)

document.addEventListener('DOMContentLoaded', function() {
  const mobileWrapper = document.querySelector('.mobile-wrapper');
  const fallingFlowers = document.querySelectorAll('.falling-flower');

  fallingFlowers.forEach(flower => {
    const randomDelay = Math.random() * 5; // Penundaan acak
    const randomDuration = Math.random() * 5 + 5; // Durasi acak (5-10 detik)
    const randomStartOpacity = Math.random() * 0.5 + 0.5; // Opacity awal acak (0.5 - 1.0)
    
    let randomScale;

    // Jika ingin bunga di depan lebih besar/lebih jelas dan bunga di belakang lebih kecil/buram:
    if (flower.classList.contains('falling-flower-front')) {
        // UBAH BARIS INI: Mengurangi rentang ukuran untuk bunga depan
        randomScale = Math.random() * 0.6 + 0.8; // Sekarang berkisar (0.8 - 1.4)
        // Sebelumnya: Math.random() * 0.8 + 1.0; // Ini berkisar (1.0 - 1.8)
        // flower.style.filter = 'none'; // Pastikan tidak ada blur
    } else if (flower.classList.contains('falling-flower-back')) {
        randomScale = Math.random() * 0.4 + 0.6; // Bunga belakang sedikit lebih kecil (0.6 - 1.0)
        flower.style.opacity = Math.random() * 0.3 + 0.2; // Lebih transparan (0.2 - 0.5)
        flower.style.filter = `blur(${Math.random() * 0.8 + 0.2}px)`; // Sedikit blur untuk kedalaman
    } else { // Jika ada bunga yang hanya punya kelas falling-flower saja (fallback)
        randomScale = Math.random() * 0.7 + 0.9;
    }

    const randomRotationStart = Math.random() * 360; // Rotasi awal acak

    flower.style.animationDelay = `${randomDelay}s`;
    flower.style.animationDuration = `${randomDuration}s`;
    flower.style.opacity = randomStartOpacity; // Initial opacity for all, will be overridden for back flowers
    flower.style.transform = `scale(${randomScale}) rotate(${randomRotationStart}deg)`;

    // Reset posisi bunga setelah animasi selesai untuk efek tak berujung
    flower.addEventListener('animationiteration', () => {
      const randomLeft = Math.random() * 100;
      let randomScaleReset;

      // Sesuaikan skala saat reset berdasarkan tipe bunga
      if (flower.classList.contains('falling-flower-front')) {
          // UBAH BARIS INI: Mengurangi rentang ukuran saat reset
          randomScaleReset = Math.random() * 0.6 + 0.8;
      } else if (flower.classList.contains('falling-flower-back')) {
          randomScaleReset = Math.random() * 0.4 + 0.6;
          flower.style.opacity = Math.random() * 0.3 + 0.2; // Jaga transparansi saat reset
          flower.style.filter = `blur(${Math.random() * 0.8 + 0.2}px)`; // Jaga blur saat reset
      } else { // Jika ada bunga yang hanya punya kelas falling-flower saja (fallback)
          randomScaleReset = Math.random() * 0.7 + 0.9;
      }

      const randomRotationReset = Math.random() * 360;
      flower.style.left = `${randomLeft}%`;
      flower.style.top = `-50px`; // Mulai dari atas lagi
      flower.style.transform = `scale(${randomScaleReset}) rotate(${randomRotationReset}deg)`;
    });
  });

  // ... sisa kode Anda di script.js atau flower.js (misalnya AOS.init())
});