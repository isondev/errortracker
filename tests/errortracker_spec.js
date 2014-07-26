function MockError (msg, url, lineNumber, colNumbre, errorObj) {

  return this;
}

function setup() {
  errortracker.initialize({
      storage: {
          maxSize: 1000,
          type: "localStorage"
      },
      addToServerDbUrl: "/api/to/add/errorReports"
  });
}

function MockWindowError (msg, fileName, lineNumber, columnNumber, errObject) {
  msg = msg || "default msg";
  fileName = fileName || "default fileName";
  lineNumber = lineNumber || 1;
  columnNumber = columnNumber || 1;
  errObject = errObject || {stack: "stack"};

  return [
    msg,
    fileName,
    lineNumber,
    columnNumber,
    errObject    
  ];
}

function raseError (err) {
  if (typeof err === "undefined")
    errorObject = MockWindowError();
  else
    errorObject = err;
    errortracker.report("error", errorObject);
}

/*
 *  Sadly we didn't start writing tests from the beggining of 
 *  writing this library, the tests below are written after version 1.3.2
 *  and you might find really dummy stuff in there, but we continue to 
 *  refactore both oure code and our tests and move them up in this file
 *  until the whole tests below will be removed.
 */
setup();


test("test framework, is ready to be used", function (assert) {
  assert.equal( 1, 1, "dummy test" );
});

asyncTest("storage to json retruns correct number of recorded errors", function (assert) {
  errortracker.clearStorage();
  raseError();
  raseError();
  raseError();

  setTimeout(function () {
    var errs = errortracker.storageToJSON();
    assert.equal( errs.length, 3, "A single error is found in storage");
    QUnit.start();
  }, 0);

});

asyncTest("errortracker default properties are assigned correctly", function (assert) {
  errortracker.clearStorage();
  var errorObj = new MockWindowError("msg", "url", 55, 66, {stack: "stack"});
  raseError(errorObj);

  setTimeout(function () {
    var errs = errortracker.storageToJSON();
    assert.equal( errs[0].Message, "msg", "error message");
    assert.equal( errs[0].FileName, "url", "file name or url");
    assert.equal( errs[0].LineNumber, 55, "line number");
    assert.equal( errs[0].ColumnNumber, 66, "column number");
    assert.ok( /stack/.test(errs[0].StackTrace[0]), "stack trace");
    QUnit.start();
  }, 0);

});

asyncTest("errors comming from try catch are counted and reported correctly", function (assert) {
  errortracker.clearStorage();
  var errorObj = {
    message: "error comming from try catch",
    stack: "stack trace"
  }
  raseError(errorObj);

  setTimeout(function () {
    var errs = errortracker.storageToJSON();
    assert.ok(/error comming from try catch/.test(errs[0].Message));
    assert.ok(/stack trace/.test(errs[0].StackTrace[0]));
    QUnit.start();
  }, 0);

});

asyncTest("manual reports wokr correctly", function (assert) {
  errortracker.clearStorage();
  errortracker.report("error", "A manual report")

  setTimeout(function () {
    var errs = errortracker.storageToJSON();
    assert.ok(/A manual report/.test(errs[0].Message))
    QUnit.start();
  }, 0)
});

asyncTest("exclude functionality works as expected", function (assert) {
  errortracker.clearStorage();
  errortracker.initialize({
    storage: {
      maxSize: 1000,
      type: 'localStorage'
    },
    exclude: [
      { Message: /excluded error/ }
    ],
    addToServerDbUrl: '/api/to/add/errorReports'
  });

  var errorObj = new MockWindowError("this is an excluded error message", "url", 55, 66, {stack: "stack"});
  raseError(errorObj);
  setTimeout(function () {
    var errs = errortracker.storageToJSON();
    assert.ok(errs === null);
    QUnit.start();
  }, 0)  

});

