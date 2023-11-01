<script>
    import JSZip from 'jszip';
    import { uploader, subir_test_case } from './uploader.js';

    let token = '';
    let exerciseName = '';
    let exerciseToken = '';
    let url = 'https://production-dot-clearn-project.wl.r.appspot.com/';

    let didntPutToken = false;
    let didntPutName = false;
    let didntPutQuestionId = false;

    let zipFile = null;
    let error = null;
    
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
            // return;
        }
  
      try {
        const zip = new JSZip();
        const zipData = await zip.loadAsync(zipFile);
        const data = await zipData.files

        // token ="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkJCMnZqTDZROEJRZGpTZzdQZW1UeCJ9.eyJodHRwczovL2NsZWFybi5jbC9lbWFpbCI6ImNsZW1lbnRlLnNlcGx2ZWRhQHVjLmNsIiwiaXNzIjoiaHR0cHM6Ly9jbGVhcm4tcHJvZC51cy5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NjNlNjY1Y2RlMDJlMjllMjZhZGZhODhmIiwiYXVkIjpbImh0dHBzOi8vY2xlYXJuLXByb2R1Y3Rpb24udmVyY2VsLmFwcC8iLCJodHRwczovL2NsZWFybi1wcm9kLnVzLmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE2OTg4MDg3NzAsImV4cCI6MTY5ODg5NTE3MCwiYXpwIjoicUdqR1NmT2YzcDU3RXpJYmNycXFlNEY3eXUxSFJvc1MiLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIG9mZmxpbmVfYWNjZXNzIn0.X4tyHBpT2p4GNw82GrtcMagCrrnS4dHq6U04dNUHxjavnbHUDz7wEHzRRRv-uX1YyrhfyfckXbMsPZe17RLxUPVWjIEG9q8G0Nhpz56edmKtgYlQKfqx_jbi2sIQ9KxzAWLzC0DuAuafFGsuV8-Lb_d8UcDZTqsbJrEV29nPb0H3yHY139YsDdoecrs1Iodt0POPVHc3aCecWBtXiMTFo_k90F4f6sDidYOX7i3bqzpho_aX7eIHnf-Pm1iY_yddu20wNYcBIXuKSj5lDydniuILLIcf5G02krtdBMXu_TLv170PC9RWjba4_dEqgsYxkV3zKoeM4UhA4z6XYtMhiw"
        // exerciseToken = "cloftz21v0lnis60p1tvykpra"
        // exerciseName = "TEST"

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

      } catch (err) {
        console.error(`Error: ${err}`);
        error = err;
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