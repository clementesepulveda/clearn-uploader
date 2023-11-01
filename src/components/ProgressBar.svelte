
<script>
    export let progress;
    export let total;
</script>

<progress id="uploading" value={progress} max="{total}">{progress}%</progress>
<!-- <progress id="uploading" value=50 max="90">{progress}%</progress> -->

<style>
    progress {
        font-size: larger;
        height: 5rem;

        border: none;
        border-radius: 5px;
        width: 100%
    }
    
    progress::-webkit-progress-bar {
        background-color: #a0adff;
        border-radius: 5px;
    }
    progress::-webkit-progress-value {
        background-color: #4C64FD;
        border-radius: 5px;
    }
</style>