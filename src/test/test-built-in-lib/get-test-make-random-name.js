/**
 * Provider of testMakeRandomName with bound context.
 */
function getTestMakeRandomName() {
  const logBuiltIn = this.logBuiltIn;

  return testMakeRandomName;

  /**
   * Test makeRandomName of optionsApp.
   *   @param {object} count - { ofParamsCalls: <number> },
   *   @param {function} opt
   */
  function testMakeRandomName(count, opt) {
    // TODO: this console.log is colored in browser, but not in node
    console.log(
      '\n\n%c ============ TESTING OF optionsApp\'s makeRandomName ========================================================================================== \n' +
      '  This function creates:                                                                                                                         \n' +
      '    - one-word name, or compound name                                                                                                            \n' +
      '    - from collection <array of strings>, or alphabet <string>                                                                                   \n' +
      '    - of random length within specified range (from 0 to 100 chars)                                                                              \n' +
      '    - uppercased, lowercased or first-letter uppercased                                                                                          \n' +
      '  Below are steps of function\'s processing (called with srcData: { userName: \'John Doe\' }) and testing of different min-max values.             ',
      'background:lightyellow'
    );
    const params = [];

    params[0] = { msg1: 'If allNames, work only with its content.',
      msg2: 'If collection, take data from it, do not check other props of allNames.',
      call: { args: [{ userName: 'John Doe' }, '_currVal_'] },
      callingWithInfo: 'namesInCompoundName === 5:',
      vals: [{
        quantity: 3,
        byPath: [
          opt(getOption()).obtain()
        ],
      }],
    };

    params[1] = { msg1: 'If allNames...',
      msg2: 'If collection...',
      call: { args: [{ userName: 'John Doe' }, '_currVal_'] },
      callingWithInfo: 'namesInCompoundName === 0:',
      vals: [{
        quantity: 3,
        byPath: [
          opt(getOption()).assign('allNames', 'namesInCompoundName', 0)
                          .obtain()
        ],
      }],
    };

    params[2] = { msg1: 'If allNames...',
      msg2: 'If collection...',
      call: { args: [{ userName: 'John Doe' }, '_currVal_'] },
      callingWithInfo: 'namesInCompoundName === -3:',
      vals: [{
        quantity: 3,
        byPath: [
          opt(getOption()).assign('allNames', 'namesInCompoundName', -3)
                          .obtain()
        ],
      }],
    };

    params[3] = { msg1: 'If allNames...',
      msg2: 'If collection...',
      call: { args: [{ userName: 'John Doe' }, '_currVal_'] },
      callingWithInfo: 'namesInCompoundName === Infinity:',
      vals: [{
        quantity: 3,
        byPath: [
          opt(getOption()).assign('allNames', 'namesInCompoundName', Infinity)
                          .obtain()
        ],
      }],
    };

    params[4] = { msg1: 'If allNames...',
      msg2: '!collection.',
      call: { args: [{ userName: 'John Doe' }, '_currVal_'] },
      callingWithInfo: 'namesInCompoundName === 5; length from 0 to 5::',
      vals: [{
        quantity: 3,
        byPath: [
          opt(getOption()).delete('allNames', 'collection')
                          .obtain()
        ],
      }],
    };

    params[5] = { msg1: 'If allNames...',
      msg2: '!collection.',
      call: { args: [{ userName: 'John Doe' }, '_currVal_'] },
      callingWithInfo: 'namesInCompoundName === 5; length from 5 to 20:',
      vals: [{
        quantity: 3,
        byPath: [
          opt(getOption()).assign('allNames', 'minLength', 5, 'maxLength', 20)
                          .delete('allNames', 'collection', 'capitalizeAllLetters')
                          .obtain()
        ],
      }],
    };

    params[6] = { msg1: 'If !allNames, work with name1, name2 etc.',
      msg2: 'e.g. in created compound name \'John Lloyd Smith\' name1 is \'John\' etc.',
      call: { args: [{ userName: 'John Doe' }, '_currVal_'] },
      callingWithInfo: 'name1 - collection;\n' +
                       'name2 - collection;\n' +
                       'name3 - !collection, length from 5 to 10:',
      vals: [{
        quantity: 3,
        byPath: [
          opt(getOption()).delete('allNames')
                          .obtain()
        ],
      }],
    };

    params[7] = { msg1: 'If !allNames...',
      msg2: 'e.g. if name1.collection - take random name from it for \'name1\', ' +
            'if !name2.collection - create \'name2\' within specified range of minLength - maxLength.',
      call: { args: [{ userName: 'John Doe' }, '_currVal_'] },
      callingWithInfo: 'name1 - !collection;\n' +
                       'name2 - !collection, length from 1 to 8;\n' +
                       'name3 - !collection, !minLength, length to 20:',
      vals: [{
        quantity: 3,
        byPath: [
          opt(getOption()).delete('allNames')
                          .delete('name1', 'collection')
                          .delete('name2', 'collection')
                          .delete('name3', 'minLength')
                          .assign('name2', 'minLength', 1, 'maxLength', 8)
                          .assign('name3', 'maxLength', 20)
                          .obtain()
        ],
      }],
    };

    params[8] = { msg1: 'If !allNames...',
      msg2: 'If no maxLength, name\'s length is up to +15 chars compared to minLength, but does not exceed 100.',
      call: { args: [{ userName: 'John Doe' }, '_currVal_'] },
      callingWithInfo: 'name1 - !collection, length from 5;\n' +
                       'name2 - !collection, length from 10;\n' +
                       'name3 - !collection, length from 15:',
      vals: [{
        quantity: 3,
        byPath: [
          opt(getOption()).delete('allNames')
                          .delete('name1', 'collection', 'maxLength')
                          .delete('name2', 'collection', 'maxLength')
                          .delete('name3', 'maxLength')
                          .assign('name2', 'minLength', 10)
                          .assign('name3', 'minLength', 15)
                          .obtain()
        ],
      }],
    };

    params[9] = { msg1: 'If !allNames...',
      msg2: 'If no minLength, name\'s length is up to -15 chars compared to maxLength, but not less than 0.',
      call: { args: [{ userName: 'John Doe' }, '_currVal_'] },
      callingWithInfo: 'name1 - !collection, length to 5;\n' +
                       'name2 - !collection, length to 15;\n' +
                       'name3 - !collection, length to 30:',
      vals: [{
        quantity: 3,
        byPath: [
          opt(getOption()).delete('allNames')
                          .delete('name1', 'collection', 'minLength', 'capitalizeFirstLetter')
                          .delete('name2', 'collection', 'minLength')
                          .delete('name3', 'minLength')
                          .assign('name1', 'capitalizeAllLetters', true, 'maxLength', 5)
                          .assign('name2', 'maxLength', 15)
                          .assign('name3', 'maxLength', 30)
                          .obtain()
        ],
      }],
    };

    params[10] = { msg1: 'If no alphabet specified, English alphabet is used.',
      msg2: 'Generally, alphabet is not restricted to be only letters, ' +
            'it can be any chars concatenated into a single string - e.g. \'_^&?y94fse#\'.',
      call: { args: [{ userName: 'John Doe' }, '_currVal_'] },
      callingWithInfo: '!alphabet; \nallNames - !collection, length from 5 to 20:',
      vals: [{
        quantity: 3,
        byPath: [
          opt(getOption()).delete('allNames', 'collection', 'capitalizeAllLetters')
                          .assign('allNames', 'minLength', 5, 'maxLength', 20)
                          .delete('alphabet')
                          .obtain()
        ],
      }],
    };

    (() => {
      const minMax = [
        0, 0,
        1, 1,
        0, 1,
        1, 0,
        -1, 0,
        0, -1,
        -78, 51,
        78, -14,
        78, 333,
        214, 280,
        null, {},
        NaN, Infinity,
        Infinity, Infinity,
        [], 'fsdf',
        false, false,
        true, true,
        0n, 1n,
        -0n, -1n,
        undefined, undefined,
        undefined, 2144,
        2144, undefined,
        -2145, undefined,
        undefined, -9856
      ];

      let idx = 0;
      while (idx < minMax.length) {
        params[params.length] = {
          msg1: 'Testing different values of minLength and maxLength.',
          msg2: 'Max length of each name in compound name - 100 chars.',
          call: { args: [{ userName: 'John Doe' }, '_currVal_'] },
          callingWithInfo: `each name of compound name is within: minLength - ${minMax[idx]}, maxLength - ${minMax[idx + 1]}:`,
          vals: [{
            quantity: 3,
            byPath: [
              opt(getOption()).delete('allNames', 'collection', 'capitalizeAllLetters')
                              .delete('name1')
                              .delete('name2')
                              .delete('name3')
                              .assign('allNames', 'namesInCompoundName', 3, 'minLength', minMax[idx], 'maxLength', minMax[idx + 1])
                              .obtain()
            ],
          }],
          hook: result => {
            const data = result.map(r => {
              const names = r.userName.split(' ').map(n => n.length);
              let i = 0;
              while (i < names.length) { r[`_name${i + 1}Length`] = names[i]; i += 1; }
              r._compoundNameLengthWithSpaces = r.userName.length;
              return r;
            });
            console.log(data);
          },
        };
        idx += 2;
      }
    })();


    return logBuiltIn(count, params, 'testMakeRandomName');

    function getOption() {
      return {
        type: 'string', name: 'makeRandomName', path: 'userName',
        data: {
          alphabet: 'abcdef',
          allNames: {
            minLength: 0,
            maxLength: 5,
            namesInCompoundName: 5,
            capitalizeAllLetters: true,
            collection: ['Tilda', 'Laura', 'Kevin'],
          },
          name1: {
            minLength: 5,
            maxLength: 10,
            capitalizeFirstLetter: false,
            collection: ['Tilda', 'Laura', 'Kevin'],
          },
          name2: {
            minLength: 5,
            maxLength: 10,
            collection: ['Clementine', 'Christopher', 'Quentin'],
          },
          name3: {
            minLength: 5,
            maxLength: 10,
          },
        },
      };
    }
  }
}

module.exports = getTestMakeRandomName;
