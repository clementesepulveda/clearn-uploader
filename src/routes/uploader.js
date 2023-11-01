export async function subir_test_case(testCaseIndex, isPublic, BEAREN_TOKEN, questionId, config, zipData, URL) {
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

    let test_case_files = []
    if ("files" in config) {
        config['files'].forEach(async file => {
            if (!file.isCommon) {
                test_case_files.push({
                    "path": file.path,
                    "permissions": "none",
                    "content": await zipData['common/' + file.path].async('text')
                })
            }
        })
    }

    const testcase_variables = {
        "data": {
            "questionId": questionId,
            "isPublic": isPublic,
            "expectedOutput": await zipData[`test_cases/${testCase}/output.txt`].async('text'),
            "input": {
                "stdin": await zipData[`test_cases/${testCase}/output.txt`].async('text'),
                "code": {"files": test_case_files},
            },
            "points": !isPublic ? 10 : 0, 
        }
    }

    const body = {"query": testcase_mutation, "variables": testcase_variables}
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${BEAREN_TOKEN}`,
    }

    const response = await fetch(URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
    }) 
    console.log(response)
    // TODO check if error
}

export async function uploader(BEAREN_TOKEN, questionId, exerciseTitle, config, zipData, URL) {
    
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${BEAREN_TOKEN}`,
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
                    "permissions": "none",
                    "content": await zipData['common/' + file.path].async('text')
                })
            } else {
                source.push({
                    "path": file.path,
                    "permissions": "none",
                    "content": ''
                })
            }
        })
    }
    
    const question_variables = {
        "data": {
            "title": exerciseTitle,
            "description": await zipData['instructions.md'].async('text'),
            "code": {
                "source": source,
                "input": {"entry": config['entry']},
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
