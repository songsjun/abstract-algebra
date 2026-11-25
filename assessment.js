'use strict';

const firstAssessment = [
  {
    section: '0.2', prompt: '用带余除法计算 gcd(78, 30)。第一步 78 = 2·30 + 18 后，应把哪一对数送入下一轮？',
    options: ['78 和 18', '30 和 18', '30 和 2', '18 和 2'], answer: 1,
    explanation: '辗转相除用上一轮的除数与余数替换原数对。78 和 30 的公约数正是 30 和 18 的公约数。'
  },
  {
    section: '1.1', prompt: '在正有理数上做通常的乘法。元素 4/7 的逆元是什么？',
    options: ['−4/7', '3/7', '4/7', '7/4'], answer: 3,
    explanation: '乘法单位元是 1。只有 (4/7)·(7/4) = 1。'
  },
  {
    section: '1.3', prompt: '在置换 σ = (1 4 2)(3 5) 中，σ² 把 4 送到哪里？',
    options: ['1', '2', '4', '5'], answer: 0,
    explanation: '先沿循环走一步 4 ↦ 2，再走一步 2 ↦ 1。另一个循环与 4 无关。'
  },
  {
    section: '2.3', prompt: '在加法群 ℤ/18ℤ 中，元素 [12] 的阶是多少？',
    options: ['2', '6', '3', '12'], answer: 2,
    explanation: '连续的正倍数给出 [12]、[6]、[0]。最小的正整数倍数是 3。'
  },
  {
    section: '3.1', prompt: '设 φ:G → K 是群同态，H = ker φ。若 φ(a) = φ(b)，下面哪项一定成立？',
    options: ['a = b', 'a⁻¹b ∈ H', 'H = {e}', 'ab ∈ H'], answer: 1,
    explanation: 'φ(a⁻¹b) = φ(a)⁻¹φ(b) = e，所以 a⁻¹b 在核中。'
  },
  {
    section: '3.2', prompt: '有限群 G 有 42 个元素。已知子群 H 有 7 个元素，G 有多少个不同的左陪集？',
    options: ['7', '35', '42', '6'], answer: 3,
    explanation: '左陪集把 G 分成互不相交的块。每块有 7 个元素，所以有 42 ÷ 7 = 6 块。'
  },
  {
    section: '4.1', prompt: '一个 24 阶群作用在集合 X 上。点 x 的稳定子有 4 个元素。x 的轨道有几个点？',
    options: ['4', '8', '6', '24'], answer: 2,
    explanation: '轨道大小等于稳定子的指数，因此是 24 ÷ 4 = 6。'
  },
  {
    section: '5.1', prompt: '在加法群 C₄ × C₆ 中，若 a、b 分别是两个因子的生成元，(a,b) 的阶是多少？',
    options: ['12', '24', '10', '6'], answer: 0,
    explanation: '两个坐标必须同时回到 0。最小正次数是 4 和 6 的最小公倍数 12。'
  },
  {
    section: '7.1', prompt: '在环 ℤ/21ℤ 中，哪个元素是单位？',
    options: ['[7]', '[3]', '[14]', '[8]'], answer: 3,
    explanation: '一个剩余类是单位，当且仅当它与 21 互素。8 互素，而且 8·8 ≡ 1（模 21）。'
  },
  {
    section: '7.3', prompt: '取模同态 φ:ℤ → ℤ/11ℤ 的核是什么？',
    options: ['{0}', '11ℤ', 'ℤ/11ℤ', '{1,2,…,10}'], answer: 1,
    explanation: '核由映到零类的整数构成，正好是 11 的所有整数倍。'
  },
  {
    section: '7.4', prompt: '在整数环 ℤ 中，哪一个是极大理想？',
    options: ['(13)', '(8)', '(10)', '(12)'], answer: 0,
    explanation: 'ℤ/(13) 是域，所以 (13) 是极大理想。其余三个商环都有非零零因子。'
  },
  {
    section: '7.6', prompt: '已知 x ≡ 1（模 4），x ≡ 2（模 7）。在 0 ≤ x < 28 中，x 等于多少？',
    options: ['2', '15', '9', '23'], answer: 2,
    explanation: '在 0 到 27 中，与 2 模 7 同余的数是 2、9、16、23。只有 9 除以 4 余 1。'
  },
  {
    section: '8.2', prompt: '在整数环 ℤ 中，理想 (27,45) 可以写成哪一个主理想？',
    options: ['(3)', '(9)', '(18)', '(72)'], answer: 1,
    explanation: '27 和 45 的所有整数线性组合构成 gcd(27,45) 的倍数。这里最大公因数为 9。'
  },
  {
    section: '9.4', prompt: '在 𝔽₅[x] 中，以下哪个二次多项式不可约？',
    options: ['x² − 1', 'x² + x', 'x² + x − 2', 'x² + 2'], answer: 3,
    explanation: '二次多项式可约当且仅当它有根。将 0、1、2、3、4 代入 x² + 2，模 5 的值为 2、3、1、1、3，均非零。前三项分别在 1、0、1 有根。'
  },
  {
    section: '10.1', prompt: '把加法群 ℤ/10ℤ 看作 ℤ-模。标量 4 作用在元素 [3] 上得到什么？',
    options: ['[7]', '[3]', '[2]', '[4]'], answer: 2,
    explanation: '整数标量 4 表示把元素相加四次。4·[3] = [12] = [2]。'
  },
  {
    section: '11.1', prompt: 'ℚ³ 中的向量 (1,0,0)、(0,1,0)、(1,1,0) 张成的子空间维数是多少？',
    options: ['2', '1', '3', '0'], answer: 0,
    explanation: '前两个向量线性无关。第三个是它们的和，因此没有增加维数。'
  },
  {
    section: '11.2', prompt: '在线性变换 T:ℚ² → ℚ² 的标准基下，已知 T(e₁) = (1,4)，T(e₂) = (0,3)。矩阵的第二列是什么？',
    options: ['(1,0)ᵀ', '(4,3)ᵀ', '(1,4)ᵀ', '(0,3)ᵀ'], answer: 3,
    explanation: '第 j 列是第 j 个输入基向量的像在输出基下的坐标。第二列是 T(e₂) 的坐标。'
  },
  {
    section: '13.2', prompt: '实数 α 满足 α³ = 7。若已知 x³ − 7 在 ℚ[x] 中不可约，则 [ℚ(α):ℚ] 等于多少？',
    options: ['7', '3', '1', '2'], answer: 1,
    explanation: 'x³ − 7 是 α 在 ℚ 上的首一最小多项式。扩张次数等于它的次数 3。'
  },
  {
    section: '14.1', prompt: '设 σ 是固定 ℚ 的非恒等自同构，作用在 ℚ(√11) 上。σ(2 + √11) 等于什么？',
    options: ['−2 − √11', '2 + √11', '2 − √11', '−2 + √11'], answer: 2,
    explanation: 'σ 固定有理数 2。它必须把 √11 送到 x² − 11 的一个根。如果仍送到 √11，它就固定整个扩张域。因此 σ(2 + √11) = 2 − √11。'
  },
  {
    section: '14.3', prompt: '一个有限域有 81 个元素。把它看作 𝔽₃ 上的向量空间，维数是多少？',
    options: ['4', '3', '9', '27'], answer: 0,
    explanation: '如果维数是 n，选定一组基后，每个向量由 n 个各有 3 种取值的坐标决定。81 = 3⁴，所以 n = 4。'
  }
];

const revisedItems = {
  4: {
    section: '3.3', prompt: '群同态 φ:ℤ → ℤ/12ℤ 由 φ(n) = [4n] 给出。按第一同构定理，像 im φ 与哪个群同构？',
    options: ['ℤ/4ℤ', 'ℤ/3ℤ', 'ℤ/12ℤ', 'ℤ'], answer: 1,
    explanation: 'φ(n) = [0] 当且仅当 12 整除 4n，也就是 3 整除 n。核为 3ℤ，所以 im φ ≅ ℤ/3ℤ。'
  },
  7: {
    section: '4.5', prompt: '群 G 有 56 个元素，且某个 7 阶子群不正规。G 有几个西洛 7-子群？',
    options: ['8', '1', '7', '4'], answer: 0,
    explanation: '56 = 7·8。西洛 7-子群的个数整除 8 且模 7 余 1，只可能是 1 或 8。7 阶子群都是西洛 7-子群。若只有一个，它必正规，因此有 8 个。'
  },
  18: {
    section: '14.2', prompt: '有限伽罗瓦扩张 K/F 的伽罗瓦群 G 有 18 个元素。子群 H 有 2 个元素，E 是 H 的固定域。扩张次数 [K:E] 和 [E:F] 分别是多少？',
    options: ['9 和 2', '2 和 18', '2 和 9', '18 和 2'], answer: 2,
    explanation: '伽罗瓦对应给出 [K:E] = |H| = 2，[E:F] = [G:H] = 18 / 2 = 9。'
  }
};

// Keep the first form available so saved answers can still be read against the original questions.
window.assessmentForms = {
  1: firstAssessment,
  2: firstAssessment.map((question, index) => revisedItems[index] ?? question)
};
