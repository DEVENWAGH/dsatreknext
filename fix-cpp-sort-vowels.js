// Fix C++ bottomCode for Sort Vowels problem
const problemId = 'ce260bac-6969-4464-91a0-f924bd8c7a02';

const fixedBottomCode = {
  CPP: `int main() {
    string input;
    getline(cin, input);
    
    // Remove quotes properly
    if (input.length() >= 2 && input[0] == '"' && input[input.length()-1] == '"') {
        input = input.substr(1, input.length() - 2);
    }
    
    string result = sortVowels(input);
    cout << "\\"" << result << "\\"" << endl;
    
    return 0;
}`
};

async function fixCppCode() {
  try {
    // First get the current problem
    const getResponse = await fetch(`http://localhost:3000/api/problems/${problemId}`);
    const problemData = await getResponse.json();
    
    if (!problemData.success) {
      console.log('❌ Failed to get problem:', problemData.message);
      return;
    }
    
    const problem = problemData.problem;
    
    // Update the bottomCode
    const updatedBottomCode = {
      ...problem.bottomCode,
      ...fixedBottomCode
    };
    
    // Update the problem
    const updateResponse = await fetch(`http://localhost:3000/api/problems/${problemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...problem,
        bottomCode: updatedBottomCode
      }),
    });

    const result = await updateResponse.json();

    if (result.success) {
      console.log('✅ C++ code fixed successfully!');
    } else {
      console.log('❌ Failed to fix C++ code:', result.message);
    }
  } catch (error) {
    console.error('❌ Error fixing C++ code:', error);
  }
}

fixCppCode();