import { error } from "@sveltejs/kit";

export async function subir_test_case(testCaseIndex, isPublic, BEARER_TOKEN, questionId, config, zipData, URL) {
    const testcase_mutation = `
    mutation CreateTestCase($data: CreateTestCase!) {
      createTestCase(data: $data) {
        id
        number
        input
        expectedOutput
        isPublic
      }
    }
    `;

    const testCase = String(testCaseIndex).padStart(2, '0')
    let errorThrown = ""

    let test_case_files = []
    if ("files" in config) {
        config['files'].forEach(async file => {
            if (!("isCommon" in file)) {
                errorThrown = `Test case ${testCaseIndex}, ${file.path} no tiene el atributo isCommon`;
                throw Error();
            }
            if (!("path" in file)) {
                errorThrown = `Test case ${testCaseIndex}, File no tiene path.`;
                throw Error(`Test case ${testCaseIndex}, File no tiene path.`);
            }

            if (!file.isCommon) {
                if (!(`test_cases/${testCase}/${file.path}` in zipData)) {
                    errorThrown = `Test case ${testCaseIndex}, No existe el archivo ${file.path}`;
                    throw Error();
                }
                test_case_files.push({
                    "path": file.path,
                    "permissions": file.permissions,
                    "selectNew": true,
                    "contentNew": await zipData[`test_cases/${testCase}/${file.path}`].async('text'),
                })
            }
        })
    }

    if (errorThrown !== "") {
        throw Error(errorThrown)
    }
    if (!(`test_cases/${testCase}/input.txt` in zipData)) {
        throw Error(`Test case ${testCaseIndex}, No existe un input.txt`)
    }
    if (!(`test_cases/${testCase}/output.txt` in zipData)) {
        throw Error(`Test case ${testCaseIndex}, No existe un output.txt`)
    }

    const testcase_variables = {
        "data": {
            "questionId": questionId,
            "isPublic": isPublic,
            "expectedOutput": await zipData[`test_cases/${testCase}/output.txt`].async('text'),
            "input": {
                "stdin": await zipData[`test_cases/${testCase}/input.txt`].async('text'),
                "code": {"files": test_case_files},
            },
            "points": !isPublic ? 10 : 0, 
        }
    }

    const body = {"query": testcase_mutation, "variables": testcase_variables}
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${BEARER_TOKEN}`,
    }

    const response = await fetch(URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
    }) 

    console.log(response)
    if (!response.ok){
        throw Error(`Test case ${testCaseIndex}, Error del servidor: ${response}`)
    }
}

export async function uploader(BEARER_TOKEN, questionId, exerciseTitle, config, zipData, URL) {
    await delete_test_cases(questionId, URL, BEARER_TOKEN);

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${BEARER_TOKEN}`,
    }

    const question_mutation = `
    mutation UpdateQuestion($data: QuestionUpdate!, $where: QuestionsFilter!, $config: UpdateQuestionConfig!) {
      updateQuestion(data: $data, where: $where, config: $config) {
        title
        description
        code
        programmingLanguage
      }
    }
    `;

    const source = [
        {
            "path": "code.py",
            "content": await zipData['starter_code.py'].async('text'),
            "permissions": "write",
        },
        {
            "path": "main.py",
            "content": config['entry'] in zipData ? await zipData[config['entry']].async('text') : "# No leas esto wey, es ilegal\n",
            "permissions": "none",
        },
    ]

    // just common files
    if ("files" in config) {
        config['files'].forEach(async file => {
            if (file.isCommon) {
                source.push({
                    "path": file.path,
                    "permissions": file.permissions,
                    "content": await zipData['common/' + file.path].async('text')
                })
            } else {
                source.push({
                    "path": file.path,
                    "permissions": file.permissions,
                    "content": ''
                })
            }
        })
    }
    
    if (!('instructions.md' in zipData)) {
        throw Error('No está el archivo instructions.md');
    }

    const question_variables = {
        "data": {
            "title": exerciseTitle,
            "description": await zipData['instructions.md'].async('text'),
            "code": {
                "source": source,
                "input": {"entry": config['entry']==="code.py" ? "code.py" : "main.py"},
            },
            "programmingLanguage": "Python",
        },
        "where": {"id": {"equals": questionId}},
        "config": {"executionTimeLimit": 10, "testGroupSize": 1},
    }

    let payload = {"query": question_mutation, "variables": question_variables}

    // Send the POST request to the GraphQL endpoint
    const response = await fetch(URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
    }) 
    console.log(response)
    // TODO check if error
}

export async function delete_test_cases(questionId, URL, BEARER_TOKEN) {
    const delete_mutation = `
    mutation DeleteTestCase($where: DeleteTestCaseFilter!) {
        deleteTestCase(where: $where) {
            id
        }
    }`

    const test_ids = await get_tests_from_question(questionId, URL, BEARER_TOKEN)
    
    for (let i = 0; i < test_ids.length; i++) {
        const tid = test_ids[i];
        const variables = {"where": {"id": tid}}
        const body = {"query": delete_mutation, "variables": variables}
        
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${BEARER_TOKEN}`,
        }
        
        await fetch(URL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
        }) 
    }
}

async function get_tests_from_question(question_id, URL, BEARER_TOKEN){
    const headers = {
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${BEARER_TOKEN}`
    }

    const query = `
    query TestCasesFromQuestion($where: QuestionsFilter) {
    questions(where: $where) {
    publicTestCases {
      id
    }
    secretTestCases {
      id
    }
    }
    }`
    
    const variables = {
        "where": {
            "id": {
                "equals": question_id
            }
        }
    }
    
    const body = {"query": query, "variables": variables}
    
    // Send the POST request to the GraphQL endpoint
    const response = await fetch(URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
    }) 

    const data = await response.json()

    // const data = json.loads(response.text)

    const publicTestCases = data.data.questions[0].publicTestCases;
    const secretTestCases = data.data.questions[0].secretTestCases;
    
    const test_ids = [
        ...publicTestCases.map(test => test.id),
        ...secretTestCases.map(test => test.id)
    ];

    return test_ids
}