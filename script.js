class NodeHeap {
	constructor(value) {
		this.value = value;
		this.leftChild = null;
		this.rightChild = null;
		this.parent = null;
	};

	display() {
		console.log(`NodeHeap value: ${this.value}.`);
	};
};

class TreeHeap {
	#root;
	#maxSize;
	#length;

	constructor(maxSize = Infinity) {
		this.#root = null;
		this.#maxSize = maxSize;
		this.#length = 0;
	};

	getSize() {
		return this.#length;
	};

	isEmpty() {
		return this.#length === 0;
	};

	isFull() {
		return this.#maxSize === this.#length;
	};

	#getPath(n) {
		const result = [];

		let currentNum = n;

		// Генерация двоичного представления порядкового номера
		while(currentNum >= 1) {
			result.push(currentNum % 2);

			currentNum = Math.floor(currentNum / 2);
		}

		result.reverse();

		result.shift();

		return result;
	};

	#goUp(nodeHeap) {
		const saveValueNode = nodeHeap.value;
		let current = nodeHeap;
		let parent = nodeHeap.parent;

		while(current.parent && saveValueNode > parent.value) {
			current.value = parent.value;
			parent.value = saveValueNode;

			current = parent;
			parent = current.parent;
		}

		current.value = saveValueNode;

		return true;
	};

	#goDown(nodeHeap) {
		const saveValueNode = nodeHeap.value;
		let current = nodeHeap;
		let large = current;

		while(true) {
			if (current.rightChild && current.rightChild.value > current.leftChild.value) {
				large = current.rightChild;

			} else {
				large = current.leftChild;
			}

			if (large && large.value < saveValueNode) {
				break;
			}

			if (large) {
				current.value = large.value;

				large.value = saveValueNode;

				current = large;

			} else {
				break;
			}
		}

		return true;
	};

	insert(value) {
		if (this.isFull()) {
			throw new Error('TreeHeap is full... Operation insert(value) is not supported.');
		}

		const newNode = new NodeHeap(value);

		if (this.#length === 0) {
			this.#root = newNode;

		} else {
			// По аналогии с деревом Хаффмана мы хотим получить двоичное представление порядкового номера значения, которое позволит нам отыскать крайний узел
			// Для вставки всегда требуется искать место, куда будет уже вставлен элемент, поэтому приходится преждевременно длину увеличивать: this.#length + 1
			// Просто для поиска последнего элемента делать прибавку 1 не требуется
			const arrPath = this.#getPath(this.#length + 1);

			let currentNode = this.#root;

			for (let m = 0; m < arrPath.length; m++) {
				const segmentPath = arrPath[m];

				switch(segmentPath) {
					case 1:
						if (currentNode.rightChild) {
							currentNode = currentNode.rightChild;

						} else {
							currentNode.rightChild = newNode;
						}
					break;
					case 0:
						if (currentNode.leftChild) {
							currentNode = currentNode.leftChild;

						} else {
							currentNode.leftChild = newNode;
						}
					break;
					default:
						throw new Error('Invalid segment path... Method insert().');
				}
			}

			newNode.parent = currentNode;

			this.#goUp(newNode);
		}

		this.#length++;

		return true;
	};

	remove() {
		if (this.isEmpty()) {
			throw new Error('TreeHeap is empty... Operation remove() is not supported.');
		}

		const deleteValue = this.#root.value;

		if (this.#length === 1) {
			this.#root = null;

		} else {
			const arrPath = this.#getPath(this.#length);

			let currentNode = this.#root;

			for (let m = 0; m < arrPath.length; m++) {
				const segmentPath = arrPath[m];

				switch(segmentPath) {
					case 1:
						currentNode = currentNode.rightChild;
					break;
					case 0:
						currentNode = currentNode.leftChild;
					break;
					default:
						throw new Error('Invalid segment path... Method remove().')
				}
			}

			const parent = currentNode.parent;

			if (parent.leftChild === currentNode) {
				parent.leftChild = null;

			} else {
				parent.rightChild = null;
			}

			this.#root.value = currentNode.value;

			this.#goDown(this.#root);
		}

		this.#length--;

		return deleteValue;
	};

	change(index, newValue) {
		if (this.isEmpty()) {
			throw new Error('Structure is empty... Operation change(index, newValue) is not supported.');
		}

		if (index < 0 || index >= this.getSize()) {
			throw new Error(`Invalid index. The transmitted index value - ${index}.`);
		}

		const arrPath = this.#getPath(index + 1);

		let currentNode = this.#root;

		for (let m = 0; m < arrPath.length; m++) {
			const segmentPath = arrPath[m];

			switch(segmentPath) {
				case 1:
					currentNode = currentNode.rightChild;
				break;
				case 0:
					currentNode = currentNode.leftChild;
				break;
				default:
					throw new Error('Invalid segment path... Method change(index, newValue).')
			}
		}

		const oldValue = currentNode.value;

		currentNode.value = newValue;

		if (oldValue < newValue) {
			return this.#goUp(currentNode);
		}

		return this.#goDown(currentNode);
	};

	centeredTraversal() {
		if (this.isEmpty()) {
			return false;
		}

		const stack = [];

		let currentNode = this.#root;

		while(currentNode || stack.length) {
			if (currentNode) {
				stack.push(currentNode);

				currentNode = currentNode.leftChild;

			} else {
				const node = stack.pop();

				if (node) {
					console.log(node.value);

					currentNode = node.rightChild;
				}
			}
		}

		return true;
	};

	draw() {
		if (this.isEmpty()) {
			return false;
		}

		let pow = 2;

		while(pow <= this.#length) {
			pow = pow * pow;
		}

		let result = [];

		let queue = [];

		queue.push({ depth: 0, node: this.#root, leftB: 0, rightB: pow });

		while(queue.length) {
			const { depth, node, leftB, rightB } = queue.shift();

			if (!result[depth]) {
				result[depth] = new Array(pow).fill('  ');
			}

			const mid = Math.floor((leftB + rightB) / 2);

			result[depth][mid] = node.value;

			if (node.leftChild) {
				queue.push({ depth: depth + 1, node: node.leftChild, leftB, rightB: mid });
			}

			if (node.rightChild) {
				queue.push({ depth: depth + 1, node: node.rightChild, leftB: mid + 1, rightB });
			}
		}

		for (let m = 0; m < result.length; m++) {
			const line = result[m];

			console.log(line.join(' '));
		}

		return true;
	};
};

class PyramidalHeap {
	#data;

	constructor(maxSize = Infinity) {
		this.#data = new TreeHeap(maxSize);
	};

	getSize() {
		return this.#data.getSize();
	};

	isEmpty() {
		return this.#data.isEmpty();
	};

	isFull() {
		return this.#data.isFull();
	};

	insert(value) {
		try {
			return this.#data.insert(value);
		} catch (err) {
			throw new Error('Pyramidal heap is full... Operation insert(value) is not supported.');
		}
	};

	remove() {
		try {
			return this.#data.remove();
		} catch (err) {
			throw new Error('Pyramidal heap is full... Operation remove() is not supported.');
		}
	};

	draw() {
		const status = this.#data.draw();

		if (!status) {
			console.log('PyramidalHeap is empty.');
		}
	};

	change(index, newValue) {
		return this.#data.change(index, newValue);
	};
};

const pyramidalHeap = new PyramidalHeap();

pyramidalHeap.insert(70);
pyramidalHeap.insert(40);
pyramidalHeap.insert(50);
pyramidalHeap.insert(20);
pyramidalHeap.insert(60);
pyramidalHeap.insert(100);
pyramidalHeap.insert(80);
pyramidalHeap.insert(30);
pyramidalHeap.insert(10);
pyramidalHeap.insert(90);
pyramidalHeap.insert(53);

// console.log(pyramidalHeap.remove(), '!!!');
// console.log(pyramidalHeap.remove(), '!!!');
// console.log(pyramidalHeap.remove(), '!!!');
// console.log(pyramidalHeap.remove(), '!!!');
// console.log(pyramidalHeap.remove(), '!!!');
// console.log(pyramidalHeap.remove(), '!!!');
// console.log(pyramidalHeap.remove(), '!!!');
// console.log(pyramidalHeap.remove(), '!!!');
// console.log(pyramidalHeap.remove(), '!!!');
// console.log(pyramidalHeap.remove(), '!!!');
// console.log(pyramidalHeap.remove(), '!!!');

pyramidalHeap.change(10, 99);
pyramidalHeap.change(8, 120);
pyramidalHeap.change(2, 7);
pyramidalHeap.change(1, 5);

pyramidalHeap.draw();