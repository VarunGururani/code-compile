// Language catalogue with starter templates and Piston language metadata.
// Piston (https://emkc.org/api/v2/piston) is a free public API that runs code
// inside isolated Docker containers - we just call it from the frontend.

export const LANGUAGES = {
  javascript: {
    id: 'javascript',
    label: 'JavaScript (Node)',
    monaco: 'javascript',
    piston: { language: 'javascript', version: '18.15.0' },
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
    piston: { language: 'python', version: '3.10.0' },
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
    piston: { language: 'java', version: '15.0.2' },
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
    piston: { language: 'c++', version: '10.2.0' },
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
    piston: { language: 'c', version: '10.2.0' },
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
    piston: { language: 'csharp.net', version: '5.0.201' },
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
    piston: { language: 'go', version: '1.16.2' },
    template: `package main

import "fmt"

func main() {
    fmt.Println("Hello, Developer!")
}
`,
  },
  ruby: {
    id: 'ruby',
    label: 'Ruby',
    monaco: 'ruby',
    piston: { language: 'ruby', version: '3.0.1' },
    template: `def greet(name)
  "Hello, #{name}!"
end

puts greet("Developer")
`,
  },
  php: {
    id: 'php',
    label: 'PHP',
    monaco: 'php',
    piston: { language: 'php', version: '8.2.3' },
    template: `<?php
function greet($name) {
    return "Hello, $name!";
}
echo greet("Developer") . PHP_EOL;
`,
  },
  typescript: {
    id: 'typescript',
    label: 'TypeScript',
    monaco: 'typescript',
    piston: { language: 'typescript', version: '5.0.3' },
    template: `function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("Developer"));
`,
  },
};

export const LANGUAGE_LIST = Object.values(LANGUAGES);

export const FILE_EXTENSIONS = {
  javascript: 'js',
  typescript: 'ts',
  python: 'py',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  csharp: 'cs',
  go: 'go',
  ruby: 'rb',
  php: 'php',
};
