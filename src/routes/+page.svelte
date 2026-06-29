<script>
    // @ts-nocheck 


   //import=Draggable from '$lib/Draggable.svelte'; (if you want to use the Draggable component, uncomment this line and ensure the path is correct)

   /* Draggable component usage (Decouple the Draggable script from the main script block; it should be handled as a standalone entity.)
    <Draggable 
    src="/your-image.png/.gif" //must be in your static folder
    alt="Draggable_Image_Name" 
    initialX={0} 
    initialY={0} 
    size={200} //as you prefer 
    />
    */ 

    import { onDestroy } from 'svelte'; // Prevent memory leaks by using dynamic imports
    
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

    let timeLeft = $state(15); // Start the countdown timer with a 15-second duration
    let timerId = null;        //setInterval ID

    // Fetch the high score from browser local storage; default to 0 if not found
    let highScore = $state(
        typeof window !== 'undefined' ? Number(localStorage.getItem('candy_highscore') || 0) : 0
    );
    
    function clearRecord() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('candy_highscore'); // Clear data from Local Storage
            highScore = 0; // Reset the high score display on the UI immediately
        }
    }
    
  // Function to initiate the timer
    function startTimer() {
        if (timerId) clearInterval(timerId);

        timerId = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft -= 1; // Process each second by reducing this value by 1
            } else {
                gameOver(); // When time runs out, end the game
            }
        }, 1000);
    }

    // Function to stop the timer and end the game
    function gameOver() {
        clearInterval(timerId);
        timerId = "ENDED"; // Flag to indicate the timer has ended
        alert("Time's up! Game over! :3");
    }

    function handleFlip(card) {
        // IF TIME IS UP: Prevent further card interactions
        if (timerId === "ENDED") return;

        // FIRST CARD CLICK: If the timer hasn't started yet (null), start it
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
            
        // HIGH SCORE CHECK: If current score exceeds high score, update it in memory
        // and persist the new record to the browser's disk storage.
            if (score > highScore) {
                highScore = score;
                if (typeof window !== 'undefined') {
                    localStorage.setItem('candy_highscore', highScore.toString());
                }
            }
            
           // GAME WIN CONDITION: Stop the timer if the maximum score is reached
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

   // Clear the interval from RAM when the user leaves the tab or page
    onDestroy(() => {
        if (timerId && timerId !== "ENDED") clearInterval(timerId);
    });
   
    let x = $state(300);
    let y = $state(300);
    let isDragging = false;

    function startDrag() { isDragging = true; }
    function stopDrag() { isDragging = false; }
    
    function onMouseMove(event) {
        if (isDragging) {
            x += event.movementX;
            y += event.movementY;
        }
    }

</script>

<main translate="no" class="notranslate min-h-screen bg-linear-to-br from-rose-200 via-rose-100 to-orange-100 text-stone-800 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
    
    <div class="mb-8 text-center flex flex-col items-center gap-3">
        <h1 class="text-4xl font-black text-rose-400 uppercase tracking-tighter mb-2">Sweet Match</h1>
        
        <div class="flex flex-wrap justify-center gap-4">
            <div class="bg-rose-200/90 px-6 py-2 rounded-full border border-rose-300 inline-block shadow-md">
                <span class="text-rose-700 uppercase text-xs font-black tracking-widest">Score:</span>
                <span class="text-xl font-mono font-bold text-stone-800 ml-2">{score}</span>
            </div>

            <div class="bg-rose-200/90 px-6 py-2 rounded-full border border-rose-300 inline-block shadow-md">
                <span class="text-rose-700 uppercase text-xs font-black tracking-widest">Time:</span>
                <span class="text-xl font-mono font-bold text-stone-800 ml-2">{timeLeft}s</span>
            </div>

            <div class="bg-orange-200/90 px-6 py-2 rounded-full border border-orange-300 inline-block shadow-md">
                <span class="text-orange-700 uppercase text-xs font-black tracking-widest">Record:</span>
                <span class="text-xl font-mono font-bold text-stone-800 ml-2">{highScore}</span>
            </div>
        </div>

        <button
            onclick={clearRecord}
            class="text-xs text-stone-500 underline mt-4 hover:text-rose-400 transition-colors"
        >
           Reset Record
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
                <p class="text-emerald-600 font-bold mb-4 text-xl">Congratulations! You found them all! :DD</p>
            {:else}
                <p class="text-rose-500 font-bold mb-4 text-xl">Time's up! Better luck next time... :&lt;</p>
            {/if}
            <button 
                onclick={resetGame}
                class="bg-rose-400 hover:bg-rose-500 text-white font-black px-8 py-3 rounded-full shadow-md transition-transform hover:scale-105"
            >
                PLAY AGAIN
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

