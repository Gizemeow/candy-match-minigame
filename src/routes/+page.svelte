<script>
    // @ts-nocheck 
    import { onDestroy } from 'svelte'; // Bellek sızıntısını önlemek için import

    let emojis = ['🍨', '🍫', '🍪', '🍰', '🍭', '🍬'];
    
    let cards = $state(
        [...emojis, ...emojis]
            .sort(() => Math.random() - 0.5)
            .map((emoji, i) => ({
                id: i,
                emoji,
                flipped: false,
                solved: false
            }))
    );

    let selected = $state([]); 
    let score = $state(0);     

    // Svelte 5 uyumlu reaktif süre ve zamanlayıcı değişkenleri
    let timeLeft = $state(10); // Süre 10 saniye olarak başlatılır

    let timerId = null;        // Arka plandaki setInterval ID'si

    // Tarayıcı hafızasından (SSD/HDD) eski rekoru oku, eğer veri tabanında rekor yoksa 0 olarak başlat
    let highScore = $state(
        typeof window !== 'undefined' ? Number(localStorage.getItem('candy_highscore') || 0) : 0
    );
    
    function clearRecord() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('candy_highscore'); // Diskteki veriyi siler
            highScore = 0; // Ekrandaki rekor göstergesini anlık olarak sıfırlar
        }
    }
    
    // Zamanlayıcıyı başlatan fonksiyon
    function startTimer() {
        if (timerId) clearInterval(timerId);

        timerId = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft -= 1; // İşlemci her saniye bu değeri 1 azaltır
            } else {
                gameOver(); // Süre 0 olduğunda oyunu bitirir
            }
        }, 1000);
    }

    // Zamanlayıcıyı durduran ve oyunu bitiren fonksiyon
    function gameOver() {
        clearInterval(timerId);
        timerId = "ENDED"; // Zamanlayıcının bittiğini işaretleyen özel bir flag
        alert("Süre bitti! Oyun bitti. :O");
    }

    function handleFlip(card) {
        // EĞER SÜRE BİTTİYSE: Kartların tıklanmasını engelle
        if (timerId === "ENDED") return;

        // İLK KART TIKLAMASI: Eğer zamanlayıcı henüz başlamadıysa (null ise) başlat
        if (timerId === null) {
            startTimer();
        }

        if (selected.length === 2 || card.flipped || card.solved) return;

        card.flipped = true;
        selected = [...selected, card];

        if (selected.length === 2) {
            checkMatch();
        }
    }

    function checkMatch() {
        const [a, b] = selected;

        if (a.emoji === b.emoji) {
            a.solved = b.solved = true;
            score += 10;
            selected = []; 
            
            // REKOR KONTROLÜ: Mevcut skor rekoru geçtiği an hem bellekteki rekoru anlık günceller
            // hem de bunu kalıcı olarak tarayıcının sabit diskine kaydeder.
            if (score > highScore) {
                highScore = score;
                if (typeof window !== 'undefined') {
                    localStorage.setItem('candy_highscore', highScore.toString());
                }
            }
            
            // OYUNUN KAZANILMA KONTROLÜ: Eğer maksimum skora ulaşıldıysa sayacı durdur
            if (score === 60) {
                clearInterval(timerId);
            }
        } else {
            setTimeout(() => {
                a.flipped = b.flipped = false;
                selected = []; 
            }, 700);
        }
    }

    function resetGame() {
        location.reload(); 
    }

    // Kullanıcı sekmeyi kapatırsa veya başka sayfaya geçerse RAM'deki sayacı temizle
    onDestroy(() => {
        if (timerId && timerId !== "ENDED") clearInterval(timerId);
    });

</script>

<main translate="no" class="notranslate min-h-screen bg-gradient-to-br from-rose-200 via-rose-100 to-orange-100 text-stone-800 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
    
    <div class="mb-8 text-center flex flex-col items-center gap-3">
        <h1 class="text-4xl font-black text-rose-400 uppercase tracking-tighter mb-2">Tatlı Eşleme</h1>
        
        <div class="flex flex-wrap justify-center gap-4">
            <div class="bg-rose-200/90 px-6 py-2 rounded-full border border-rose-300 inline-block shadow-md">
                <span class="text-rose-700 uppercase text-xs font-black tracking-widest">Skor:</span>
                <span class="text-xl font-mono font-bold text-stone-800 ml-2">{score}</span>
            </div>

            <div class="bg-rose-200/90 px-6 py-2 rounded-full border border-rose-300 inline-block shadow-md">
                <span class="text-rose-700 uppercase text-xs font-black tracking-widest">Süre:</span>
                <span class="text-xl font-mono font-bold text-stone-800 ml-2">{timeLeft}s</span>
            </div>

            <div class="bg-orange-200/90 px-6 py-2 rounded-full border border-orange-300 inline-block shadow-md">
                <span class="text-orange-700 uppercase text-xs font-black tracking-widest">Rekor:</span>
                <span class="text-xl font-mono font-bold text-stone-800 ml-2">{highScore}</span>
            </div>
        </div>

        <button
            onclick={clearRecord}
            class="text-xs text-stone-500 underline mt-4 hover:text-rose-400 transition-colors"
        >
            Rekoru Sıfırla
        </button>
    </div>

    <div class="grid grid-cols-3 md:grid-cols-4 gap-4">
        {#each cards as card (card.id)}
            <button
                onclick={() => handleFlip(card)}
                class="w-20 h-28 sm:w-24 sm:h-32 rounded-2xl flex items-center justify-center text-4xl transition-all duration-300 transform shadow-sm border
                {card.flipped || card.solved 
                    ? 'bg-orange-50 text-stone-900 border-orange-100 rotate-y-180' 
                    : 'bg-rose-300 hover:bg-rose-400 border-b-4 border-rose-400 text-white active:border-b-0 active:translate-y-1'}"
            >
                {#if card.flipped || card.solved}
                    <span class="animate-bounce-short">{card.emoji}</span>
                {:else}
                    <span class="font-bold text-rose-100">?</span>
                {/if}
            </button>
        {/each}
    </div>

    {#if score === 60 || timeLeft === 0}
        <div class="mt-10 text-center animate-pulse">
            {#if score === 60}
                <p class="text-emerald-600 font-bold mb-4 text-xl">Tebrikler! Hepsini Buldun!:DD</p>
            {:else}
                <p class="text-rose-500 font-bold mb-4 text-xl">Süre Bitti! Bir Dahaki Sefere... :&lt;</p>
            {/if}
            <button 
                onclick={resetGame}
                class="bg-rose-400 hover:bg-rose-500 text-white font-black px-8 py-3 rounded-full shadow-md transition-transform hover:scale-105"
            >
                TEKRAR OYNA
            </button>
        </div>
    {/if}
    <div class="absolute bottom-4 right-4 text-xs font-medium text-stone-800/40 tracking-wider">
    Developed by Kübra Gizem Eryılmaz
</div>
</main>

<style>
    :global(.rotate-y-180) {
        transform: rotateY(180deg);
    }
    
    @keyframes bounce-short {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
    }
    .animate-bounce-short {
        animation: bounce-short 0.5s ease-in-out;
    }
</style>