<script>
    // @ts-nocheck 
   
    let { src, alt, initialX = 100, initialY = 100, size = 200 } = $props();
    
    // svelte-ignore state_referenced_locally
    let x = $state(initialX);
    // svelte-ignore state_referenced_locally
    let y = $state(initialY);
    let isDragging = $state(false);

    function startDrag() { isDragging = true; }
    function stopDrag() { isDragging = false; }

    function onMouseMove(event) {
        if (!isDragging) return;

        // Görselin merkezi (translate -50%, -50% etkisi)
        const offset = size / 2;

        // Koordinatları hesapla ve sınırla
        // Görselin sol kenarı 0'da, sağ kenarı window.innerWidth'de durmalı
        let newX = Math.max(offset, Math.min(x + event.movementX, window.innerWidth - offset));
        let newY = Math.max(offset, Math.min(y + event.movementY, window.innerHeight - offset));

        x = newX;
        y = newY;
    }
</script>

<svelte:window onmousemove={onMouseMove} onmouseup={stopDrag} />

<div 
    class="fixed z-50 cursor-grab" 
    style="left: {x}px; top: {y}px; transform: translate(-50%, -50%); touch-action: none; flex-shrink: 0; min-width: {size}px;"
    onmousedown={(e) => { e.preventDefault(); startDrag(); }}
    role="button"
    tabindex="0"
>
    <img 
        {src} 
        {alt} 
        draggable="false" 
        class="pointer-events-none"
        style="width: {size}px; height: auto; image-rendering: pixelated; display: block;" 
    />
</div>