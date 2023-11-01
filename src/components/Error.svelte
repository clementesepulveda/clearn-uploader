<script>
    export let errorMessage;
    let nodeRef;
</script>

<div id="error" bind:this={nodeRef}>
    <div id="title">
        <h1>Error: </h1>
        <button  on:click={() => nodeRef.parentNode.removeChild(nodeRef)}>x</button>
    </div>
    <p>{errorMessage}</p>
</div>

<style>
    #error {
        background-color: red;
        /* position: absolute; */

        width: 15rem;
        border: solid black 5px;
        border-radius: 5px;
        margin: 0.5rem;
        padding: 0.5rem;
        padding-top: 0rem;

        font-family: Arial, Helvetica, sans-serif;
    }

    #title {
        display: flex;
    }

    button {
        width: 2rem;
        height: 2rem;
        margin-top: 1rem;
        margin-left: 7rem;
    }
</style>