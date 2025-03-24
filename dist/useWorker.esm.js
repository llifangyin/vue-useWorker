import { ref, onMounted, onUnmounted } from 'vue';

function useWorker(workerFunction) {
    const isRunning = ref(false);
    let worker = null;
    const createWorker = () => {
        const functionBody = workerFunction.toString();
        const blob = new Blob([`onmessage = async (e) => { postMessage(await (${functionBody})(...e.data)); };`], { type: 'application/javascript' });
        return new Worker(URL.createObjectURL(blob));
    };
    const callWorker = (...args) => {
        if (!worker) {
            worker = createWorker();
        }
        isRunning.value = true;
        return new Promise((resolve, reject) => {
            if (!worker)
                return;
            worker.onmessage = (e) => {
                isRunning.value = false;
                resolve(e.data);
            };
            worker.onerror = (err) => {
                isRunning.value = false;
                reject(err);
            };
            worker.postMessage(args);
        });
    };
    const terminateWorker = () => {
        if (worker) {
            worker.terminate();
            worker = null;
            isRunning.value = false;
        }
    };
    onMounted(() => {
        // Optionally initialize the worker on mount
    });
    onUnmounted(() => {
        terminateWorker();
    });
    return [callWorker, { isRunning, terminateWorker }];
}

export { useWorker };
