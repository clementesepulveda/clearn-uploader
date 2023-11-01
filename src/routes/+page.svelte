<script>
    import JSZip from 'jszip';
    import { uploader, subir_test_case } from './uploader.js';

    let token = '';
    let exerciseName = '';
    let exerciseToken = '';
    let url = 'https://production-dot-clearn-project.wl.r.appspot.com/';

    let zipFile = null;
    let configData = null;
  
    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (!file) return;
  
      zipFile = file;
    };
  
    const handleUnzipAndRead = async () => {
      if (!token) return;
      if (!exerciseName) return;
      if (!exerciseToken) return;
  
      try {
        const zip = new JSZip();
        const zipData = await zip.loadAsync(zipFile);
        const data = await zipData.files


        let config = await data['config.json'].async('text')
        config = JSON.parse(config)

        // archivos iniciales
        uploader(token, exerciseToken, exerciseName, config, data, url)

        // test cases
        for (let i = 0; i < config['public']; i++) {
            await subir_test_case(i, true, token, exerciseToken, config, data, url)
        }
        for (let i = config['public']; i < config['public'] + config['private']; i++) {
            await subir_test_case(i, false, token, exerciseToken, config, data, url)
        }

      } catch (error) {
        console.error('Error unzipping and reading the file:', error);
        configData = 'An error occurred while unzipping and reading the file.';
      }
    };
  </script>
  
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
        <input type="text" bind:value={token} placeholder="Token de usuario Clearn" />
        <br>

        <h3>Id del Ejercicio</h3>
        <input type="text" bind:value={exerciseToken} placeholder="Id del Ejercicio Creado" />
        <br>

        <h3>Nombre Nuevo</h3>
        <input type="text" bind:value={exerciseName} placeholder="Nombre Nuevo del Ejercicio" />
        <br>
        
        <h3>Archivos dentro de zip</h3>
        <input type="file" accept=".zip" on:change={handleFileChange} />
        <br>
        <button on:click={handleUnzipAndRead}>Upload</button>
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
        background-color: #95EDEF;
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
        /* background-color: red; */
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
    }

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

    select {
        padding: 1rem 0.5rem;
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
            padding: 2rem;
            width: 80%;
        }
        h1 {
            font-size: 10vw;
        }
    }

  </style>