export const getComplexityData = (time, space) => {
  const complexityValues = {
    'O(1)': 1,
    'O(log n)': 2,
    'O(n)': 3,
    'O(n log n)': 4,
    'O(n^2)': 5,
    'O(n^3)': 6,
    'O(2^n)': 7,
    'O(n!)': 8
  };

  const complexityDescriptions = {
    'O(1)': 'Constant time/space — best performance, independent of input size.',
    'O(log n)': 'Logarithmic — good performance, input size increases exponentially.',
    'O(n)': 'Linear — performance grows proportionally with input size.',
    'O(n log n)': 'Linearithmic — common in efficient sorting algorithms.',
    'O(n^2)': 'Quadratic — nested loops, inefficient for large input.',
    'O(n^3)': 'Cubic — triple nested loops, very slow for large input.',
    'O(2^n)': 'Exponential — increases rapidly, typically recursion-heavy.',
    'O(n!)': 'Factorial — extremely inefficient, only for very small input sizes.'
  };

  const growthSamples = (value) => {
    const nValues = [1, 5, 10, 15, 20];
    switch (value) {
      case 'O(1)': return nValues.map(() => 1);
      case 'O(log n)': return nValues.map(n => Math.log2(n));
      case 'O(n)': return nValues.map(n => n);
      case 'O(n log n)': return nValues.map(n => n * Math.log2(n));
      case 'O(n^2)': return nValues.map(n => n * n);
      case 'O(n^3)': return nValues.map(n => n * n * n);
      case 'O(2^n)': return nValues.map(n => Math.pow(2, n));
      case 'O(n!)':
        return nValues.map(n => {
          let fact = 1;
          for (let i = 2; i <= n; i++) fact *= i;
          return fact;
        });
      default: return nValues.map(() => 0);
    }
  };

  const timeValue = complexityValues[time] || 0;
  const spaceValue = complexityValues[space] || 0;

  return {
    timeValue,
    spaceValue,
    timeDetails: {
      label: time,
      description: complexityDescriptions[time] || 'Unknown time complexity.',
      value: timeValue
    },
    spaceDetails: {
      label: space,
      description: complexityDescriptions[space] || 'Unknown space complexity.',
      value: spaceValue
    },
    timeGrowth: growthSamples(time),
    spaceGrowth: growthSamples(space)
  };
};

export const analyzeComplexity = (code, language) => {
  let timeComplexity = 'O(1)';
  let spaceComplexity = 'O(1)';
  const normalizedCode = code.toLowerCase().replace(/\s+/g, ' ');

  const nestedLoopPattern = /for.*for|while.*while|for.*while|while.*for/g;
  const singleLoopPattern = /for\s*\(|while\s*\(|for\s+\w+\s+in|for\s+\w+\s+of/g;
  const recursivePattern = /(\w+)\s*\([^)]*\)[\s\S]*?\1\s*\(/g;

  if (nestedLoopPattern.test(normalizedCode)) {
    const forCount = (normalizedCode.match(/for/g) || []).length;
    const whileCount = (normalizedCode.match(/while/g) || []).length;
    const totalLoops = forCount + whileCount;

    if (totalLoops >= 3) timeComplexity = 'O(n^3)';
    else if (totalLoops >= 2) timeComplexity = 'O(n^2)';
  } else if (singleLoopPattern.test(normalizedCode)) {
    if (normalizedCode.includes('log') || normalizedCode.includes('/= 2') || normalizedCode.includes('* 2')) {
      timeComplexity = 'O(n log n)';
    } else {
      timeComplexity = 'O(n)';
    }
  } else if (recursivePattern.test(normalizedCode)) {
    if (normalizedCode.includes('fibonacci') || normalizedCode.includes('fib')) timeComplexity = 'O(2^n)';
    else if (normalizedCode.includes('factorial')) timeComplexity = 'O(n!)';
    else timeComplexity = 'O(log n)';
  }

  let hasVariableArray = false;
  let has2DArray = false;
  let hasRecursion = false;
  let hasDynamicStructure = false;

  const arrayPatterns = [
    /new\s+\w+\[\s*\w+\s*\]/g,
    /\w+\[\s*\]\s*=\s*new\s+\w+\[\s*\w+\s*\]/g,
    /\w+\s*=\s*new\s+\w+\[\s*\w+\s*\]/g,
    /list\s*=\s*\[\]/g,
    /array\s*=\s*\[\]/g,
    /\w+\s*=\s*\[\s*\]/g
  ];
  const matrix2DPatterns = [
    /new\s+\w+\[\s*\w+\s*\]\s*\[\s*\w+\s*\]/g,
    /\[\s*\[\s*\]\s*for/g,
    /matrix|grid|board/g
  ];
  const recursiveSpacePatterns = [/(\w+)\s*\([^)]*\)[\s\S]*?\1\s*\(/g];
  const dynamicStructurePatterns = [
    /vector|arraylist|list|set|map|dictionary|hashtable|stack|queue/gi,
    /append|push|add|insert|put/gi
  ];

  arrayPatterns.forEach(p => { if (p.test(normalizedCode)) hasVariableArray = true; });
  matrix2DPatterns.forEach(p => { if (p.test(normalizedCode)) has2DArray = true; });
  if (recursiveSpacePatterns.some(p => p.test(normalizedCode))) hasRecursion = true;
  if (dynamicStructurePatterns.some(p => p.test(normalizedCode))) hasDynamicStructure = true;

  if (has2DArray) spaceComplexity = 'O(n^2)';
  else if (hasVariableArray || hasDynamicStructure) spaceComplexity = 'O(n)';
  else if (hasRecursion) {
    if (normalizedCode.includes('fibonacci') || normalizedCode.includes('fib')) spaceComplexity = 'O(n)';
    else if (normalizedCode.includes('factorial')) spaceComplexity = 'O(n)';
    else spaceComplexity = 'O(log n)';
  } else spaceComplexity = 'O(1)';

  return { timeComplexity, spaceComplexity };
};
