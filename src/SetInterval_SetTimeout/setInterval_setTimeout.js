// ─────────────────────────────────────────
//  STORAGE
// ─────────────────────────────────────────

const timers = {};
const loops  = {};

const NEXT_ID     = Symbol("nextId");
const IS_RUNNING  = Symbol("isRunning");

window[NEXT_ID]    = 1;
window[IS_RUNNING] = false;


// ─────────────────────────────────────────
//  setTimeout  —  ek baar
// ─────────────────────────────────────────

window.setTimeout = (fn, delay = 0, ...args) => {
    const id = window[NEXT_ID]++;

    timers[id] = {
        callback : () => fn(...args),
        runAt    : Date.now() + delay
    };

    startLoop();
    return id;
};

window.clearTimeout = (id) => delete timers[id];


// ─────────────────────────────────────────
//  setInterval  —  baar baar
// ─────────────────────────────────────────

window.setInterval = (fn, delay = 0, ...args) => {
    const id = window[NEXT_ID]++;

    loops[id] = {
        callback : () => fn(...args),
        delay,
        runAt    : Date.now() + delay
    };

    startLoop();
    return id;
};

window.clearInterval = (id) => delete loops[id];


// ─────────────────────────────────────────
//  CORE LOOP
// ─────────────────────────────────────────

function startLoop() {

    if (window[IS_RUNNING]) return;
    window[IS_RUNNING] = true;

    function tick() {
        const now = Date.now();

        for (const id in timers) {
            if (now >= timers[id].runAt) {
                timers[id].callback();
                delete timers[id];            // ek baar → hata do
            }
        }

        for (const id in loops) {
            if (now >= loops[id].runAt) {
                loops[id].callback();
                loops[id].runAt = Date.now() + loops[id].delay;  // reset
            }
        }

        requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}


// ─────────────────────────────────────────
//  TEST
// ─────────────────────────────────────────

setTimeout((name) => {
    console.log("Timeout:", name);           // ek baar, 2s baad
}, 2000, "Silver Surfer");

const id = setInterval((name) => {
    console.log("Interval:", name);          // har 1s pe
}, 1000, "Rahul");

setTimeout(() => {
    clearInterval(id);
    console.log("Interval band");            // 5s baad loop rok do
}, 5000);