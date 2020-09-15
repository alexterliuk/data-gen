/**
 * Provider of testMakeRandomText with bound context.
 */
function getTestMakeRandomText() {
  const logBuiltIn = this.logBuiltIn;

  /**
   * Test makeRandomText of optionsApp.
   *   @param {object} count - { ofParamsCalls: <number> },
   *   @param {function} opt
   */
  function testMakeRandomText(count, opt) {
    // TODO: this console.log is colored in browser, but not in node
    console.log(
      '\n\n%c ============ TESTING OF optionsApp\'s makeRandomText ========================================================================================== \n' +
      '  This function creates text of random length within specified min-max length range (including spaces).                                          \n' +
      '  If option.data.collection, it doesn\'t check any other prop of option.data - it just takes a value from collection to be a text.                \n' +
      '  If there is no collection, it slices text chunks from textSample given by user, or from built-in textSample.                                   \n' +
      '  Below is illustration of how the function works with different arguments. It is called with srcData: { description: \'Some text\' }).            ',
      'background:lightyellow'
    );
    const textSample = 'A software design pattern is a general, reusable solution to a commonly occurring problem ' +
                       'within a given context in software design. Design patterns are formalized best practices.';
    const params = [];

    params[0] = { msg1: 'If collection, take data from it, do not check other props of option.data.',
      call: { args: [{ description: 'Some text' }, '_currVal_'] },
      vals: [{
        quantity: 5,
        byPath: [
          opt(getOption()).obtain()
        ],
      }],
    };

    params[1] = { msg1: 'If no collection, create text within min-max length range - from 0 to 70.',
      call: { args: [{ description: 'Some text' }, '_currVal_'] },
      vals: [{
        quantity: 5,
        byPath: [
          opt(getOption()).delete('collection')
                          .obtain()
        ],
      }],
      hook,
    };

    params[2] = { msg1: 'If no collection, create text within min-max length range - from 0 to 70.',
      msg2: 'startFromBeginning - <true> (text should start from the beginning of textSample)',
      call: { args: [{ description: 'Some text' }, '_currVal_'] },
      vals: [{
        quantity: 5,
        byPath: [
          opt(getOption()).delete('collection')
                          .assign(false, 'startFromBeginning', true)
                          .obtain()
        ],
      }],
      hook,
    };

    params[3] = { msg1: 'If textSample, slice random text chunks from it within length range. ' +
                        'If !textSample, text chunks are sliced from built-in textSample.',
      call: { args: [{ description: 'Some text' }, '_currVal_'] },
      vals: [{
        quantity: 5,
        byPath: [
          opt(getOption()).delete('collection')
                          .assign(false, 'startFromBeginning', true, 'textSample', textSample)
                          .obtain()
        ],
      }],
      hook,
    };

    params[4] = { msg1: 'If !startFromBeginning --> If alphabet, slice a char from it to put as first char if needed ' +
                                                                  '(e.g. first char in text is space or apostrophe). ' +
                        'If !alphabet, use for this purpose built-in alphabet (English).',
      msg2: 'alphabet - \'xyz\'',
      call: { args: [{ description: 'Some text' }, '_currVal_'] },
      vals: [{
        quantity: 5,
        byPath: [
          opt(getOption()).delete('collection')
                          .assign(false, 'alphabet', 'xyz')
                          .obtain()
        ],
      }],
      hook,
    };

    params[5] = { msg1: 'Length - from 0 to 500.',
      msg2: 'capitalizeFirstLetter - <false>',
      call: { args: [{ description: 'Some text' }, '_currVal_'] },
      vals: [{
        quantity: 20,
        byPath: [
          opt(getOption()).delete('collection')
                          .assign(false, 'minLength', 0, 'maxLength', 500, 'capitalizeFirstLetter', false)
                          .obtain()
        ],
      }],
      hook,
    };

    params[6] = { msg1: 'Length - from 0 to 500.',
      msg2: 'capitalizeAllLetters - <true>',
      call: { args: [{ description: 'Some text' }, '_currVal_'] },
      vals: [{
        quantity: 20,
        byPath: [
          opt(getOption()).delete('collection')
                          .assign(false, 'minLength', 0, 'maxLength', 500, 'capitalizeAllLetters', true)
                          .obtain()
        ],
      }],
      hook,
    };


    return logBuiltIn(count, params, 'testMakeRandomText');

    function hook(result) {
      const data = result.map(r => { r._length = r.description.length; return r; });
      console.log(data);
    }

    function getOption() {
      return {
        type: 'string', name: 'makeRandomText', path: 'description',
        data: {
          collection: [
            'Once upon a time.',
            'Terminator will come.',
            'To be or not to be.',
            'Sitting in a chair is nice business.',
            'Daily coding.'
          ],
          minLength: 0,
          maxLength: 70,
          startFromBeginning: false,
          // capitalizeAllLetters: true,
          // capitalizeFirstLetter: false
        },
      };
    }
  }

  return testMakeRandomText;
}

module.exports = getTestMakeRandomText;
