function fuckScrollChaining($mask, $modal) {
    const listenerOpts = { passive: false };
    $mask.addEventListener(
        'touchmove',
        e => {
            e.preventDefault();
        },
        listenerOpts,
    );
    const modalHeight = $modal.clientHeight;
    const modalScrollHeight = $modal.scrollHeight;
    let startY = 0;

    $modal.addEventListener('touchstart', e => {
        startY = e.touches[0].pageY;
    });
    $modal.addEventListener(
        'touchmove',
        e => {
            let endY = e.touches[0].pageY;
            let delta = endY - startY;

            if (
                ($modal.scrollTop === 0 && delta > 0) ||
                ($modal.scrollTop + modalHeight === modalScrollHeight &&
                    delta < 0)
            ) {
                e.preventDefault();
            }
        },
        listenerOpts,
    );
}
