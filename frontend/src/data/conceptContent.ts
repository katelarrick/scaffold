export interface ConceptContent {
  description?: string;
  example?: string;
  practice?: string;
}

export const conceptContent: Record<string, ConceptContent> = {
  'data-types': {
    description: 'Data is any piece of information that your program stores or works with. In Python, the basic data types are integers, floats, strings, and booleans. Data types help Python store and use information correctly.',
    example: '7\n8.12\n"I love learning Python"\nFalse',
    practice: 'https://us.prairielearn.com/',
  },
  'data-types:Numeric types (integers, floats)': {
    description: 'Numeric types are used to store numbers in Python. Integers ("ints") are whole numbers. Floats are numbers with a decimal point. Integers and floats can both be positive or negative.',
    example: '29\n-6.88888',
    practice: 'https://us.prairielearn.com/',
  },
  'data-types:Strings': {
    description: 'A string is how Python stores text. A string can be a single character, an entire paragraph, or even an empty space. Strings are created by putting quotation marks at the start and end of text. You can use single quotes or double quotes, as long as they match on both sides.',
    example: '# Empty string\n\'\'\n\'This is a string.\'\n"This is also a string."',
    practice: 'https://us.prairielearn.com/',
  },
  'data-types:Booleans': {
    description: 'A boolean ("bool") data type can only be one of two values: True or False. The value must be capitalized with no quotation marks around it.',
    example: 'True\nFalse',
    practice: 'https://us.prairielearn.com/',
  },
  'variables': {
    description: 'A variable is a named container that stores a piece of data so your program can use it later. A variable is like a labeled box, where the label is the variable\'s name, and whatever is inside the box is its value. Variables let you reference, update, and reuse information throughout your program.',
    example: 'int_variable = 5\nstring_variable = "CS 8"\nboolean_variable = True',
    practice: 'https://us.prairielearn.com/',
  },
  'variables:Variable names': {
    description: 'A variable name is the label you give a variable so you can refer to it in your code. Python has a few rules for naming variables — for example, names can\'t start with a number and can\'t contain spaces. A good habit is to choose names that clearly describe what the variable holds, like "student_name" or "graduation_year."',
    example: '# Vague variable name\nx = "Alejandro"\n\n# Specific variable name\nstudent_name = "Kyle"',
    practice: 'https://us.prairielearn.com/',
  },
  'variables:Variable assignment': {
    description: 'Variable assignment is how you create a variable and give it a value using an "=" sign. Once a variable is assigned, you can use its name anywhere in your code to access that value. You can also reassign a variable later, meaning you can give it a brand new value that overwrites the old value. A variable\'s data type changes based on what value is assigned to it.',
    example: '# Create variable1 to store a string of value \'ABC\'\nvariable1 = "ABC"\n\n# Reassign variable1 to store an integer of value 10\nvariable1 = 10\n\n# Update variable1 based on its current value\nvariable1 = variable1 + 3',
    practice: 'https://us.prairielearn.com/',
  },

  'arithmetic-ops': {
    description: 'Arithmetic operations are the basic math actions you can perform on numbers in Python. Just like a calculator, Python can add, subtract, multiply, and raise a number to a power using simple symbols.',
    example: '8 + 3\n10 / 2',
    practice: 'https://us.prairielearn.com/',
  },
  'arithmetic-ops:Simple arithmetic\n(+, -, *, **)': {
    description: 'There are four basic arithmetic symbols in Python: "+" adds, "-" subtracts, "*" multiplies, and "**" raises a number to a power. These symbols are called "operators."',
    example: '5 + 3\n5 - 3\n5 * 3\n5 ** 3',
    practice: 'https://us.prairielearn.com/',
  },
  'arithmetic-ops:Division': {
    description: 'Python has two kinds of division. Regular division using "/" always gives you a decimal result, while floor division using "//" rounds the result down to the nearest whole number.',
    example: '# The arithmetic expression below evaluates to 1.25\n5 / 4\n\n# The arithmetic expression below evaluates to 1\n5 // 4',
    practice: 'https://us.prairielearn.com/',
  },
  'arithmetic-ops:Modulo': {
    description: 'The modulo operator, %, gives you the remainder left over after dividing two numbers. It\'s useful for checking things like whether a number is even or odd. You can use modulo with floats, but the result will not always be precise due to rounding errors.',
    example: '# The arithmetic expression below evaluates to 1\n10 % 3\n\n# The arithmetic expression below evaluates to 0\n10 % 2\n\n# The arithmetic expression below evaluates to 0.5\n1.5 % 1',
    practice: 'https://us.prairielearn.com/',
  },
  'arithmetic-ops:Order of operations': {
    description: 'Python follows the standard mathematical PEMDAS order when calculating expressions: parentheses, exponents, multiplication, division, addition, and then subtraction.',
    example: '# The arithmetic expression below evaluates to 14\n2 + 3 * 4\n\n# The arithmetic expression below evaluates to 20\n(2 + 3) * 4',
    practice: 'https://us.prairielearn.com/',
  },
  'arithmetic-ops:+= and -=': {
    description: 'These two symbols are shortcuts for updating the value of a variable based on its current value. "+=" adds the value on the right to the variable on the left and stores the result back in that variable. "-=" subtracts the value on the right from the variable on the left and stores the result back in that variable.',
    example: 'x = 10\n\n# The line below is the same as x = x + 3\nx += 3\n\n# The line below is the same as x = x - 5\nx -= 5',
    practice: 'https://us.prairielearn.com/',
  },
};