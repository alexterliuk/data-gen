> Clone data with same or random values.

## Install

```
TODO
```

## About

DataGen is a cloning utility which creates _n_ instances of original data. It takes in `object` or `array`, traverses over all nested data and returns `array` with desired quantity of instances which have the same structure but different values of the same type.

For example, given an input `{ weather: 'sunny', temp: 30 }`, you can get back `[{ weather: 'rainy', temp: 17 }, { weather: 'foggy', temp: 3 }]` if you specify such options. If no options provided, you will get instances with default values `{ weather: '', temp 0 }`.

Maximum nesting level is 100, below it data is not processed. The restriction is set to avoid infinite loop in case if some child has its parent nested deeper in the tree.

## Usage

```
const task = {
  id: 1784,
  description: 'Write a novel',
  completed: false,
};

const options = {
  quantity: 100,
  byPath: [
    {
      path: 'id',
      type: 'number',
      name: 'makeRandomNumber',
      data: { min: 1000, max: 9999 },
    },
    {
      path: 'description',
      type: 'string',
      name: 'makeRandomText',
      data: { minLength: 33, maxLength: 70 },
    },
  ],
};

const newData = DataGen.make(task, options);
// [
//   { id: 7425, description: 'Unt lacus. Nulla gravida orci a odio. Nullam v', completed: true },
//   { id: 3914, description: 'Ate velit esse cillum dolore eu fugia', completed: true },
//   { id: 7719, description: 'Iquam faucibus, elit ut dictum al', completed: true },
// ]
```

## Default values

Default values for variative types are:

  - boolean `true`
  - number `0`
  - string `''`

For other types their default values are they themselves:

`[]`, `{}`, `null`, `/(?:)/`, `NaN`, `Infinity`, `undefined`

It means that if a value in data is `Infinity`, then `Infinity` will be created, not 0 as number type.\
Symbols and BigInts are ignored.

## API

TODO

#### Options

TODO
