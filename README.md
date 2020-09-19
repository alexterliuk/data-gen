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

When a key - value pair is found inside input data it is checked whether options have an option for creating value for this path. If there is no option, default value is created. Default values for variative primitives are:

  - boolean `true`
  - number `0`
  - string `''`

For other types their default values are they themselves:

`[]`, `{}`, `null`, `/(?:)/`, `NaN`, `Infinity`, `undefined`

It means that if a value in data is `Infinity`, then `Infinity` is created, not 0 as number type. If empty object is found, new empty object is created. But if an object has data, it will be processed and appropriate key - values pairs will be created. The same logic is applied for arrays.

Symbols and BigInts are ignored.

## API

There are three public methods of DataGen.

**make**

`DataGen.make(data, options)`

  - data - `object | array`
  - options - `object`
    - quantity - `string` (if omitted, no data will be created, empty `[]` is returned)
    - pathSyntax - `object`
      - singleQuotes - `boolean` (if true - usages[\'0'])
      - doubleQuotes - `boolean` (if true - usages["0"])
      - squareBraced - `boolean` (if true - \['usages']['0'] or \["usages"]["0"])

It makes *n* instances of data where *n* is `number` specified in options.quantity. Created data is returned inside `array`. If no options.quantity given, it returns empty `array`.

If no pathSyntax is given, default format for specifying path in option.path is - `x.someProp[0]`.\
If *singleQuotes: true* is set, path format is - `x.someProp['0']`.\
If *doubleQuotes: true* - `x.someProp["0"]`.\
If *squareBraced: true, singleQuotes: true* - `['x']['someProp']['0']`.\
If *squareBraced: true, doubleQuotes: true* - `["x"]["someProp"]["0"]`.

There's no need to add absolute path, relative is enough - `someProp[0]` or even `[0]` will work. But if your data has many similar paths you can expand your path, adding parent segments, until option.path becomes unique.

**test**

`DataGen.test(data, options)`

It is the wrapper for DataGen.make to switch on logging mode when along with data creation each step of this process is shown in the terminal. Logging may be customized by adding settings in options.testing.

  - options.testing - `object`
    - maxSpaceLength - `number` (width between columns; default is 30)
    - keepDataTypes - `boolean` (log values as strings | their types; default is false)
    - showAllNewVals - `boolean` (show all created values of the current path, so it is convenient to have them in one place aggregated for examining; default is false - only the first value is shown)

keepDataTypes and showAllNewVals testing options don't work in Node.js environment.

**testBuiltIn**

`DataGen.testBuiltIn(?...entities)`

This method lets you test built-in logic of DataGen. An entity is the name of a function or a procedure to test. If no entity is given, then all built-in logic is tested and the result is logged in the terminal.

  - ...entities - `strings`
    - DataGenCalling
    - valueChecker
    - helper
    - makeRandomNumber
    - makeRandomName
    - makeRandomText
    - makeRandomDateTime
___

**Options**

It is the `object` which you pass into **make** or **test**. In addition to the general settings mentioned above, you can specify options for creating randomized values for desired paths. These options are added to byPath collection.

**options.byPath**

Type: `array<objects>`

Each option inside options.byPath is `object` which has such structure.

| prop | type | description |
|:----:|:--------:|-------|
| type | `string` | type of a value to be created |
| name | `string` | name of a function responsible for creating the value |
| path | `string` | path where the value in original data is located |
| data | `object` | settings for a function which is specified in *name* |

There are 4 built-in functions which randomize values. Below are settings for them which you place inside option.data.

**makeRandomNumber**

  - min - `number`
  - max - `number`
  - digitsAfterFloatingPoint - `number`

Thus, you can set a range within which a new number will be randomly created, and whether it should be integer or float. If you give *min*, you should also give *max* and vice versa, otherwise 0 is returned. If *min* > *max*, values are automatically swapped, so *min* becomes *max* and *max* becomes *min*.

---------- text-specs ----------

option.data for next two functions - makeRandomText, makeRandomName - has similar structure which is aggregated into text-specs.

<*text-specs*> - `object`

  - minLength - `number`
  - maxLength - `number`
  - capitalizeFirstLetter - `boolean` (true by default)
  - capitalizeAllLetters - `boolean`
  - collection - `array<strings>` (make text from given texts; if present, no other prop of text-specs is checked, because they aren't needed)

**makeRandomText**

  - ...<*text-specs*>
  - startFromBeginning - `boolean` (slice from start of text sample, false by default)

This function has a built-in dummy text sample from which random parts are being sliced to compose a new text within specified min/maxLength. If collection is provided, built-in text sample is ignored and a new text is created from randomly picked strings inside the collection.

**makeRandomName**

  - alphabet - `string` (from which to slice chars randomly; if omitted English is used)
  - allNames - `object`
    - alphabet
    - namesInCompoundName - `number`
    - ...<*text-specs*>
  - name1, name2 etc. - `objects`
    - alphabet
    - ...<*text-specs*>

If option.data has allNames, then name1, name2 etc. are not checked. By namesInCompoundName you can specify how many names a full name should consist of. For example, if you want the name to have 3 names inside, you set *namesInCompoundName: 3* and provide a collection *['John', 'Lo', 'Brown']*, from which names are picked randomly (so, the full name might form as 'John Lo Brown' or 'Lo John Brown' or other combination). It there's no collection, 'Arwq Lkwpoar W' might form as a full name with length of each name to be within min/maxLength range.

If you want more freedom in customizing each name of a compound name, you don't need allNames. Instead you provide nameN specs, where N is `number`. The desired quantity of names is taken from counting nameN properties inside option.data. For example, you want that first name be 'John' or 'Laura', second - any, third - 'Brown'. So, you add name1 with a collection *['John', 'Laura']*, name2 with *minLength: 1* and *maxLength: 10*, name3 with a collection *[Brown]*. The result will be 'Laura Trk Brown' or 'John Usdrtwfg Brown' etc. 

**makeRandomDateTime**

  - years - `array<numbers>` (if omitted, range 0-9999 is used)
  - months - `array<numbers>`
  - dates - `array<numbers>`
  - hours - `array<numbers>`
  - minutes - `array<numbers>`
  - seconds - `array<numbers>`

This function creates datetime string of `YYYY-MM-DDThh:mm:ss` format. Each `array` in option.data holds desired `numbers` which should be used when constructing a datetime. Assume you want to get a datetime with a date to be 17 or 21. You specify *dates:[17, 21]* and get back a datetime with one of those two dates and random other segments. If no options.data given, datetime string will be completely random.

## Examples

**Make random names, numbers**

```
const user = { name: 'John', age: 30 };

const options = { quantity: 3 };
options.byPath = [
  {
    type: 'string',
    name: 'makeRandomName',
    path: 'name',
    data: {
      name1: { minLength: 8, maxLength: 14 },
    },
  },
  {
    type: 'number',
    name: 'makeRandomNumber',
    path: 'age',
    data: {
      min: 0,
      max: 122,
    },
  },
];

DataGen.make(user, options);

// [
//   { name: 'Phdyskth', age: 110 },
//   { name: 'Mkbolfsvti', age: 56 },
//   { name: 'Iffxfdwah', age: 54 },
// ]
```

**Get names from a collection**

```
const user = { name: 'John', age: 30 };

const options = { quantity: 3 };
options.byPath = [
  {
    type: 'string',
    name: 'makeRandomName',
    path: 'name',
    data: {
      name1: { collection: ['John', 'Kevin', 'Julia', 'Sophie'] },
      name2: { collection: ['fon', 'der'] },
      name3: { collection: ['Keflavik', 'Maroovski', 'Smith'] },
    },
  },
];

DataGen.make(user, options);

// [
//   { name: 'Julia fon Smith', age: 0 },
//   { name: 'Sophie der Keflavik', age: 0 },
//   { name: 'Kevin fon Keflavik', age: 0 },
// ]
```

**Make different numbers**

```
const pos = { x: 4, y: 17, z: 93 };

const options = { quantity: 3 };
options.byPath = [
  {
    type: 'number',
    name: 'makeRandomNumber',
    path: 'x',
    data: { min: 4, max: 4 },
  },
  {
    type: 'number',
    name: 'makeRandomNumber',
    path: 'y',
    data: { min: -100, max: 50 },
  },
  {
    type: 'number',
    name: 'makeRandomNumber',
    path: 'z',
    data: { min: 100, max: 1000, digitsAfterFloatingPoint: 3 },
  },
];

DataGen.make(pos, options);

// [
//   { x: 4, y: -3, z: 107.241 },
//   { x: 4, y: 14, z: 525.998 },
//   { x: 4, y: -55, z: 807.082 },
// ]
```

**Make random text**

```
const items = [{ id: '1o9p', description: 'BW item' }, { id: 'sl4q', description: 'Color item' }];

const options = { quantity: 3 };
options.byPath = [
  {
    type: 'string',
    name: 'makeRandomText',
    path: '[0].description',
    data: { minLength: 5, maxLength: 30 },
  },
  {
    type: 'string',
    name: 'makeRandomText',
    path: '[1].description',
    data: { collection: ['Awesome description', 'Impressions you might want to try', 'Driver'] },
  },
  {
    type: 'string',
    name: 'makeRandomName',
    path: 'id',
    data: { alphabet: 'abcdefghijkl1234567890',
            name1: { minLength: 4, maxLength: 4, capitalizeFirstLetter: false } },
  },
];

DataGen.make(items, options);

// [
//   [
//     { id: '4807', description: 'M dolore eu fu' },
//     { id: 'ig54', description: 'Impressions you might want to try' },
//   ],
//   [
//     { id: 'g3hf', description: 'Risus vulputate vehic' },
//     { id: 'f5e5', description: 'Awesome description' },
//   ],
//   [
//     { id: 'l0ci', description: 'C fermentum. Pellentesque m' },
//     { id: '5eaj', description: 'Awesome description' },
//   ],
// ]
```

**Make random datetime**

```
const options = { quantity: 3 };
options.byPath = [
  {
    type: 'string',
    name: 'makeRandomDateTime',
    path: 'dt',
    data: { years: [2020], minutes: [58, 59] },
  },
];

DataGen.make({ dt: '' }, options);

// [
//   { dt: '2020-07-13T20:59:36' },
//   { dt: '2020-09-01T16:58:31' },
//   { dt: '2020-06-18T07:58:23' },
// ]

// - - - - - - - - - - - - - - - - -

fs.writeFileSync(
  'new-data.json',
  JSON.stringify(DataGen.make({ dt: '' }, options))
);

// [{"dt":"2020-06-14T20:58:47"},{"dt":"2020-08-30T19:59:04"},{"dt":"2020-12-18T07:58:22"}]
```

**Copy complex data**

```
const category = {
  id: 1523,
  name: '',
  description: '',
  date: '',
  inUse: false,
  items: [
    {
      itemName: 'Activation Matrix 1784 DBRS',
      points: [14, -0.5498763145698756, 0],
    },
  ],
  records: [
    [258369, -123968, 700203],
    [-4.25698, 8.01703, 3.15331],
    [0, 1, -1, -1],
  ],
};

const optsData = [
  ['number', 'number', 'id', { min: 1, max: 9999 }],
  ['string', 'name', 'name', { allNames: { minLength: 5, maxLength: 15, namesInCompoundName: 3 } }],
  ['string', 'text', 'description', { minLength: 100, maxLength: 200, startFromBeginning: true }],
  ['string', 'dateTime', 'date', { years: [2020], months: [9], minutes: [0, 30], seconds: [0] }],
  ['number', 'number', 'points[0]', { min: 10, max: 99 }],
  ['number', 'number', 'points[1]', { min: -10, max: 0, digitsAfterFloatingPoint: 12 }],
  ['number', 'number', 'points[2]', { min: 0, max: 0 }],
  ['number', 'number', 'records[0][0]', { min: 100000, max: 500000 }],
  ['number', 'number', 'records[0][1]', { min: -500000, max: -100000 }],
  ['number', 'number', 'records[0][2]', { min: 500000, max: 999999 }],
  ['number', 'number', 'records[1][0]', { min: -10, max: 10, digitsAfterFloatingPoint: 5 }],
  ['number', 'number', 'records[1][1]', { min: -10, max: 10, digitsAfterFloatingPoint: 5 }],
  ['number', 'number', 'records[1][2]', { min: -10, max: 10, digitsAfterFloatingPoint: 5 }],
  ['number', 'number', 'records[2][0]', { min: -1, max: 1 }],
  ['number', 'number', 'records[2][1]', { min: -1, max: 1 }],
  ['number', 'number', 'records[2][2]', { min: -1, max: 1 }],
  ['string', 'name', 'itemName',
    {
      name1: { collection: ['Activation', 'Hydration', 'Filtration'] },
      name2: { collection: ['Matrix'] },
      name3: { alphabet: '0123456789', minLength: 4, maxLength: 4 },
      name4: { minLength: 4, maxLength: 4, capitalizeAllLetters: true },
    },
  ],
];

function makeOption(type, funcNameEnding, path, data) {
  const f = 'makeRandom' + funcNameEnding[0].toUpperCase() + funcNameEnding.slice(1);
  return { type, name: f, path, data };
}

function makeOptions(arr, qty) {
  return {
    quantity: qty,
    byPath: arr.map(d => makeOption.call({}, ...d)),
  };
}

const options = makeOptions(optsData, 3);

fs.writeFileSync(
  'new-data.json',
  JSON.stringify(DataGen.make(category, options))
);

// [{
//   "date": "2020-09-25T02:00:00",
//   "description": "Lorem ipsum dolor sit amet, consectetur...",
//   "id": 6884,
//   "inUse": true,
//   "items": [{
//     "itemName": "Hydration Matrix 7829 VDAS",
//     "points": [26, -2.884532310826, 0]
//   }],
//   "name": "Kubpsodfrpbpv Kbuaxeihyedves Yihktzdelc",
//   "records": [
//     [200062, -242021, 730448],
//     [-5.75639, -2.23289, 8.99108],
//     [0, -1, 1, 0]
//   ]
// },
// // ...  
// ]
```
