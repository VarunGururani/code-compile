// Language catalogue with starter templates and CodeX API metadata.
// CodeX (https://github.com/Jaagrav/CodeX) is a free public code execution API
// that runs each submission inside an isolated Docker container. No API key.

export const LANGUAGES = {
  javascript: {
    id: 'javascript',
    label: 'JavaScript (Node)',
    monaco: 'javascript',
    codex: 'js',
    template: `// Welcome to the Online Code Compiler
function greet(name) {
  return \`Hello, \${name}! Welcome to the playground.\`;
}

console.log(greet("Developer"));
console.log("2 + 2 =", 2 + 2);
`,
  },
  python: {
    id: 'python',
    label: 'Python 3',
    monaco: 'python',
    codex: 'py',
    template: `# Python 3
def greet(name):
    return f"Hello, {name}!"

print(greet("Developer"))
print("Sum:", sum(range(1, 11)))
`,
  },
  java: {
    id: 'java',
    label: 'Java',
    monaco: 'java',
    codex: 'java',
    template: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Developer!");
    }
}
`,
  },
  cpp: {
    id: 'cpp',
    label: 'C++ (GCC)',
    monaco: 'cpp',
    codex: 'cpp',
    template: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, Developer!" << endl;
    return 0;
}
`,
  },
  c: {
    id: 'c',
    label: 'C (GCC)',
    monaco: 'c',
    codex: 'c',
    template: `#include <stdio.h>

int main(void) {
    printf("Hello, Developer!\\n");
    return 0;
}
`,
  },
  csharp: {
    id: 'csharp',
    label: 'C#',
    monaco: 'csharp',
    codex: 'cs',
    template: `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, Developer!");
    }
}
`,
  },
  go: {
    id: 'go',
    label: 'Go',
    monaco: 'go',
    codex: 'go',
    template: `package main

import "fmt"

func main() {
    fmt.Println("Hello, Developer!")
}
`,
  },
};

export const LANGUAGE_LIST = Object.values(LANGUAGES);

export const FILE_EXTENSIONS = {
  javascript: 'js',
  python: 'py',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  csharp: 'cs',
  go: 'go',
};
