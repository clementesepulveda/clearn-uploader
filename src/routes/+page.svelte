<script>
    import JSZip from 'jszip';
    import { uploader, subir_test_case } from './uploader.js';
	import { BarLoader } from 'svelte-loading-spinners';
    import Error from '../components/Error.svelte';
    import ProgressBar from '../components/ProgressBar.svelte';

    let token = '';
    let exerciseName = '';
    let exerciseToken = '';
    let url = 'https://production-dot-clearn-project.wl.r.appspot.com/';

    let didntPutToken = false;
    let didntPutName = false;
    let didntPutQuestionId = false;

    let zipFile = null;
    let uploadingProgress = 0;
    let totalFilesToUpload = 0;
    let errors = [];

    let isLoading = false;
    
    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (!file) return;
  
      zipFile = file;
    };
  
    const handleUnzipAndRead = async () => {
        didntPutToken = false;
        didntPutQuestionId = false;
        didntPutName = false;

        if (!token) {
            didntPutToken = true;
        };
        if (!exerciseToken) {
            didntPutQuestionId = true;
        };
        if (!exerciseName) {
            didntPutName = true;
        };
        if (didntPutToken || didntPutQuestionId || didntPutName) {
            return;
        }
  
      try {
        const zip = new JSZip();
        const zipData = await zip.loadAsync(zipFile);
        const data = await zipData.files

        isLoading = true;
        uploadingProgress = 0;
        totalFilesToUpload = 100;

        if (!('config.json' in data)) {
            throw `No existe el archivo config.json`
        }
        let config = await data['config.json'].async('text')
        config = JSON.parse(config)

        // archivos iniciales
        uploader(token, exerciseToken, exerciseName, config, data, url)
        
        totalFilesToUpload = config['public'] + config['private']
        // test cases
        for (let i = 0; i < config['public']; i++) {
            await subir_test_case(i, true, token, exerciseToken, config, data, url)
            uploadingProgress += 1
        }
        for (let i = config['public']; i < config['public'] + config['private']; i++) {
            await subir_test_case(i, false, token, exerciseToken, config, data, url)
            uploadingProgress += 1
        }

        isLoading = false;

      } catch (err) {
        console.error(`Error: ${err}`);
        errors.push(err)
        errors = errors; // stupid svelte update

        isLoading = false;
      }
    };
  </script>
  

  <div id="errors">
    {#each errors as error}
        <Error errorMessage={error}></Error>
    {/each}

  </div>

  <main>
    <h1>Clearn Uploader</h1>

    <div id='inputs'>

        <h3>Url </h3>
        <select bind:value={url}>
            <option value="https://production-dot-clearn-project.wl.r.appspot.com/">https://production-dot-clearn-project.wl.r.appspot.com/</option>
            <option value="https://clearn-project.wl.r.appspot.com/">https://clearn-project.wl.r.appspot.com/</option>
        </select>
        <br>

        <h3>Token de usuario Clearn</h3>
        <input 
            type="text" 
            bind:value={token} 
            placeholder="Token de usuario Clearn" 
            class={didntPutToken ? "invalid-input" : ""}
        />
        <br>

        <h3>Id del Ejercicio</h3>
        <input 
            type="text" 
            bind:value={exerciseToken} 
            placeholder="Id del Ejercicio Creado" 
            class={didntPutQuestionId ? "invalid-input" : ""}
        />
        <br>

        <h3>Nombre Nuevo</h3>
        <input 
            type="text" 
            bind:value={exerciseName} 
            placeholder="Nombre Nuevo del Ejercicio"  
            class={didntPutName ? "invalid-input" : ""}
        />
        <br>
        
        <h3>Archivos dentro de zip</h3>
        <input type="file" accept=".zip" on:change={handleFileChange} />
        <br>

        {#if isLoading}
            <ProgressBar progress={uploadingProgress} total={totalFilesToUpload}></ProgressBar>
        {:else}
            <button on:click={handleUnzipAndRead}>Upload</button>
        {/if}
    </div>
</main>

  
<style style="scss">
    main {
        background-color: #8BDBF1;

        display: flex;
        flex-direction: column;
        align-items: center;

        font-family: Arial, Helvetica, sans-serif;
        font-size: larger;
    }

    h1 {
        font-size: 50pt;
        margin: 1rem 0;
    }

    h1, h3 {
        font-weight: 900;
    }

    #inputs {
        background-color: rgb(240, 240, 240);
        box-shadow: 10px 10px 0px black;

        padding: 3rem;
        margin-bottom: 2rem;
        border: 5px solid black;
        border-radius: 4px;

        display: flex;
        flex-direction: column;
        justify-content: center;

        width: 50%;
    }
    
    h3 {
        margin: 0%;
        padding: 0%;
    }
    
    select, input, h3 {
        font-size: larger;
    }

    button {
        background-color: #4C64FD;
        color: white;
        font-size: larger;
        height: 5rem;

        border: none;
        border-radius: 5px;
    }

    button:hover {background-color: #465ce8;}
    button:active {background-color: #4C64FD;}

    select, input {
        margin-bottom: 1rem;
    }

    input[type=text], select {
        border: 5px solid black;
        border-radius: 5px;
    }

    input[type=text] {
        padding: 1rem 0.5rem;
    }

    input[type=text], select {
        border: 5px solid black;
        border-radius: 5px;
    }

    input[type=text] {
        padding: 1rem 0.5rem;
    }

    input[type=checkbox] {
        background-color: red;
        /* outline: 5px solid black; */
        /* border: px solid black; */
        height: 3.2rem;
        width: 3.2rem;
    }

    select {
        padding: 1rem 0.5rem;
    }

    .invalid-input {
        background: rgb(255, 109, 109);
        color: white
    }
    .invalid-input::placeholder {
        color:white;
    }

    #errors {
        position: absolute;
    }

    /* Responsiveness */
    @media only screen and (min-width: 750px) and (max-width: 1000px) {
        #inputs {
            padding: 2rem;
            width: 60%;
        }
    }
    @media only screen and (min-width: 00px) and (max-width: 750px) {
        #inputs {
            padding: 1rem;
            width: 75%;
        }
        h1 {
            font-size: 10vw;
        }
    }

</style>