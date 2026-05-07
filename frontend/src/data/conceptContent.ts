export interface ConceptContent {
  description?: string;
  example?: string;
  practice?: string;
}

export const conceptContent: Record<string, ConceptContent> = {
  // keyed by conceptId for the concept itself
  'data-types': {
    description: 'Data is any piece of information that your program stores or works with. In Python, the basic data types are integers, floats, strings, and booleans. Data types help Python store and use information correctly.',
    example: '7\n8.12\n“I love learning Python”\nFalse\n',
    practice: 'https://us.prairielearn.com/',
  },
  // keyed by conceptId:subconceptLabel for subconcepts
  'data-types:Numeric types (integers, floats)': {
    description: 'Numeric types are used to store numbers in Python. Integers (“ints”) are whole numbers. Floats are numbers with a decimal point. Integers and floats can both be positive or negative.',
    example: '29\n-6.88888',
    practice: 'https://us.prairielearn.com/',
  },
  'data-types:Strings': {
    description: 'A string is how Python stores text. A string can be a single character, an entire paragraph, or even an empty space. Strings are created by putting quotation marks at the start and end of text. You can use single quotes or double quotes, as long as they match on both sides.',
    example: '# Empty string\n\'\'\n\'This is a string.\'\n“This is also a string.”',
    practice: 'https://us.prairielearn.com/',
  },
  'data-types:Booleans': {
    description: 'A boolean (“bool”) data type can only be one of two values: True or False. The value must be capitalized with no quotation marks around it.',
    example: 'True\nFalse',
    practice: 'https://us.prairielearn.com/',
  },
};
