// Language catalogue with starter templates and JDoodle API metadata.
// JDoodle (https://www.jdoodle.com/compiler-api) is a reliable code
// execution API. Free tier: 200 calls/day. Requires a free signup
// to obtain JDOODLE_CLIENT_ID and JDOODLE_CLIENT_SECRET.

export const LANGUAGES = {
  javascript: {
    id: 'javascript',
    label: 'JavaScript (Node)',
    monaco: 'javascript',
    jdoodle: { language: 'nodejs', versionIndex: '4' },
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
    jdoodle: { language: 'python3', versionIndex: '4' },
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
    jdoodle: { language: 'java', versionIndex: '4' },
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
    jdoodle: { language: 'cpp17', versionIndex: '0' },
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
    jdoodle: { language: 'c', versionIndex: '5' },
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
    jdoodle: { language: 'csharp', versionIndex: '4' },
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
    jdoodle: { language: 'go', versionIndex: '4' },
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
    jdoodle: { language: 'ruby', versionIndex: '4' },
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
    jdoodle: { language: 'php', versionIndex: '4' },
    template: `<?php
function greet($name) {
    return "Hello, $name!";
}
echo greet("Developer") . PHP_EOL;
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
  ruby: 'rb',
  php: 'php',
};
