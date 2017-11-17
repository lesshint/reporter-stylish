'use strict';

const proxyquire = require('proxyquire');
const stripAnsi = require('strip-ansi');
const expect = require('chai').expect;
const chalk = require('chalk');
const sinon = require('sinon');

/*
 * The Chalk object is read-only so we'll need to stub everything for
 * Sinon to work.
 */
const chalkStub = Object.create(chalk, {
    cyan: {
        value: (str) => {
            return chalk.cyan(str);
        },
        writable: true
    },
    green: {
        value: (str) => {
            return chalk.green(str);
        },
        writable: true
    },
    magenta: {
        value: (str) => {
            return chalk.magenta(str);
        },
        writable: true
    },
    red: {
        value: (str) => {
            return chalk.red(str);
        },
        writable: true
    },
    yellow: {
        value: (str) => {
            return chalk.yellow(str);
        },
        writable: true
    }
});

const reporter = proxyquire('./index', {
    chalk: chalkStub
});

describe('reporter:stylish', () => {
    const colorsEnabled = chalk.enabled;

    beforeEach(() => {
        chalk.enabled = false;

        sinon.stub(process.stdout, 'write');
    });

    afterEach(() => {
        if (process.stdout.write.restore) {
            process.stdout.write.restore();
        }

        chalk.enabled = colorsEnabled;
    });

    it('should not print anything when not passed any errors', () => {
        const errors = [];

        sinon.spy(console, 'log');

        reporter.report(errors);

        expect(console.log.called).to.equal(false);

        console.log.restore();
    });

    it('should print errors with colors', () => {
        const errors = [{
            column: 5,
            file: 'file.less',
            line: 1,
            linter: 'spaceBeforeBrace',
            message: 'Opening curly brace should be preceded by one space.',
            source: '.foo{ color: red; }'
        }];

        sinon.spy(console, 'log');
        sinon.spy(chalkStub, 'cyan');
        sinon.spy(chalkStub, 'green');
        sinon.spy(chalkStub, 'magenta');
        sinon.spy(chalkStub, 'yellow');

        reporter.report(errors);

        expect(chalkStub.cyan.called).to.equal(true);
        expect(chalkStub.green.called).to.equal(true);
        expect(chalkStub.magenta.called).to.equal(true);
        expect(chalkStub.yellow.called).to.equal(true);

        const message = stripAnsi(console.log.getCall(0).args[0]);

        expect(message).to.equal('Warning: file.less: line 1, col 5, spaceBeforeBrace: Opening curly brace should be preceded by one space.');

        console.log.restore();
    });

    it('should not print line when not passed one', () => {
        const errors = [{
            column: 5,
            file: 'file.less',
            linter: 'spaceBeforeBrace',
            message: 'Opening curly brace should be preceded by one space.',
            source: '.foo{ color: red; }'
        }];

        sinon.spy(console, 'log');

        reporter.report(errors);

        const message = stripAnsi(console.log.getCall(0).args[0]);

        expect(message).to.equal('Warning: file.less: col 5, spaceBeforeBrace: Opening curly brace should be preceded by one space.');

        console.log.restore();
    });

    it('should not print column when not passed one', () => {
        const errors = [{
            line: 1,
            file: 'file.less',
            linter: 'spaceBeforeBrace',
            message: 'Opening curly brace should be preceded by one space.',
            source: '.foo{ color: red; }'
        }];

        sinon.spy(console, 'log');

        reporter.report(errors);

        const message = stripAnsi(console.log.getCall(0).args[0]);

        expect(message).to.equal('Warning: file.less: line 1, spaceBeforeBrace: Opening curly brace should be preceded by one space.');

        console.log.restore();
    });

    it('should print the result severity', () => {
        const errors = [{
            line: 1,
            file: 'file.less',
            linter: 'spaceBeforeBrace',
            message: 'Opening curly brace should be preceded by one space.',
            severity: 'error',
            source: '.foo{ color: red; }'
        }];

        sinon.spy(console, 'log');
        sinon.spy(chalkStub, 'red');

        reporter.report(errors);

        expect(chalkStub.red.called).to.equal(true);

        const message = stripAnsi(console.log.getCall(0).args[0]);

        expect(message).to.equal('Error: file.less: line 1, spaceBeforeBrace: Opening curly brace should be preceded by one space.');

        console.log.restore();
    });
});
