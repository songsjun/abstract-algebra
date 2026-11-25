'use strict';

window.courseParts = [
  {id: 'prep', label: '预备知识', english: 'Preliminaries', chapters: ['0'], symbols: ['ℤ', 'gcd', 'ℤ/nℤ']},
  {id: 'groups', label: '群论', english: 'Group Theory', chapters: ['1', '2', '3', '4', '5', '6'], symbols: ['G', 'H', 'G/H']},
  {id: 'rings', label: '环论', english: 'Ring Theory', chapters: ['7', '8', '9'], symbols: ['R', 'I', 'R/I']},
  {id: 'modules', label: '模与向量空间', english: 'Modules and Vector Spaces', chapters: ['10', '11', '12'], symbols: ['R', 'M', 'M/N']},
  {id: 'fields', label: '域论与伽罗瓦理论', english: 'Field Theory and Galois Theory', chapters: ['13', '14'], symbols: ['F', 'K', '[K:F]']},
  {id: 'commutative', label: '交换代数、几何与同调', english: 'Commutative Rings, Algebraic Geometry, and Homological Algebra', chapters: ['15', '16', '17'], symbols: ['I', 'V(I)', 'Spec R']},
  {id: 'representations', label: '有限群表示论', english: 'Representation Theory of Finite Groups', chapters: ['18', '19'], symbols: ['G', 'GL(V)', 'χ']},
  {id: 'appendices', label: '附录', english: 'Appendices', chapters: ['A', 'B'], symbols: ['X', 'Y', 'X × Y']}
];

window.courseChapters = {
  0: '预备知识',
  1: '群的入门',
  2: '子群',
  3: '商群与群同态',
  4: '群作用',
  5: '直积、半直积与阿贝尔群',
  6: '群论专题',
  7: '环的入门',
  8: '欧几里得整环、PID 与 UFD',
  9: '多项式环',
  10: '模论入门',
  11: '向量空间',
  12: '主理想整环上的模',
  13: '域论',
  14: '伽罗瓦理论',
  15: '交换环与代数几何',
  16: '阿廷环、离散赋值环与戴德金整环',
  17: '同调代数与群上同调',
  18: '表示论与特征标理论',
  19: '特征标理论的例子与应用',
  A: '笛卡尔积与佐恩引理',
  B: '范畴论'
};
