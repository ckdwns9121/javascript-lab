class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEnd = false;
  }
}

class Trie {
  constructor() {
    // 모든 트라이는 빈 루트 노드를 가지고 있어야 한다.
    this.root = new TrieNode();
  }

  _validateInput(input) {
    if (!input || typeof input !== "string") {
      return false;
    }
    // 영어 알파벳만 허용하는 정규식
    return /^[a-zA-Z]+$/.test(input);
  }

  findNode(word) {
    let currentNode = this.root;

    for (let i = 0; i < word.length; i++) {
      if (!currentNode.children.has(word[i])) {
        // 존재하지 않는 단어
        return null;
      }
      currentNode = currentNode.children.get(word[i]);
    }
    return currentNode;
  }

  insert(word) {
    if (!this._validateInput(word)) {
      throw new Error("Invalid input");
    }

    // 1. 소문자로 변환한다.
    const lowerCaseWord = word.toLowerCase();

    // 2. 현재 노드를 루트 노드로 초기화한다.
    let currentNode = this.root;

    // 3. 소문자로 변환한 단어의 각 문자를 순회한다.
    for (let i = 0; i < lowerCaseWord.length; i++) {
      const char = lowerCaseWord[i];

      // 해당 문자가 현재 노드의 자식 노드에 없으면 새로 추가
      if (!currentNode.children.has(char)) {
        currentNode.children.set(char, new TrieNode());
      }

      // 4. 다음 노드로 이동
      currentNode = currentNode.children.get(char);
    }

    // 단어의 끝에 도달했을 때 해당 노드의 isEnd를 true로 설정
    currentNode.isEnd = true;
  }

  search(word) {
    if (!this._validateInput(word)) {
      throw new Error("Invalid input");
    }

    // 1. 노드를 찾는다.
    const node = this.findNode(word.toLowerCase());

    if (!node) {
      console.log("존재 하지 않는 단어", word);
      return false;
    }
    if (node.isEnd) {
      console.log("존재하는 단어", word);
      return true;
    }
    return false;
  }

  isPrefix(prefix) {
    if (!this._validateInput(prefix)) {
      throw new Error("Invalid input");
    }

    const node = this.findNode(prefix.toLowerCase());
    return node !== null; // null 아니면 무조건 접두사 존재
  }
}

const trie = new Trie();
trie.insert("hello");
trie.insert("world");
trie.insert("hi");
trie.insert("h");

console.log(trie);
trie.search("hello");
trie.search("world");
trie.search("hi");
trie.search("h");

trie.search("hellos");
