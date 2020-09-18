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

Thus, you can set a range within which a new number will be randomly created, and whether it should be integer or float.

---------- text-specs ----------

option.data for next two functions - makeRandomText, makeRandomName - has similar structure which is aggregated into text-specs.

<*text-specs*> - `object`

  - minLength - `number`
  - maxLength - `number`
  - capitalizeFirstLetter - `boolean`
  - capitalizeAllLetters - `boolean`
  - collection - `array<strings>` (make text from given texts; if present, no other prop of text-specs is checked, because they aren't needed)

**makeRandomText**

  - ...<*text-specs*>
  - startFromBeginning - `boolean` (slice from start of text sample)

This function has a built-in dummy text sample from which random parts are being sliced to compose a new text within specified min/maxLength. If collection is provided, built-in text sample is ignored and a new text is created from randomly picked strings inside the collection.

**makeRandomName**

  - alphabet - `string` (from which to slice chars randomly; if omitted English is used)
  - allNames - `object`
    - ...<*text-specs*>
    - namesInCompoundName - `number`
  - name1, name2 etc. - <*text-specs*>

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



TODO: add default values for option.data.props, indicate what is required
