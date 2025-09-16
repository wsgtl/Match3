/* eslint-disable */
const xlsx = require('node-xlsx');
const path = require('path');
const glob = require('glob');
const fs = require('fs');
const config = require('./config.json');
const tool = require('./common/tool');

/**
 * all commands
 */
const commands = {
  "--help": {
    "alias": ["-h"],
    "desc": "show this help manual.",
    "action": showHelp
  },
  "--export": {
    "alias": ["-e"],
    "desc": "export excel to json. --export [files]",
    "action": exportJson,
    "default": true
  },
  "--export-dir": {
    "alias": ["-d"],
    "desc": "export excel to json. --export [dir]",
    "action": exportDirJson
  }
};

const alias_map = {}; // mapping of alias_name -> name
let parsed_cmds = []; // cmds of parsed out.

const keys = Object.keys(commands);

for (const key in commands) {
  const alias_array = commands[key].alias;
  alias_array.forEach(e => {
    alias_map[e] = key;
  });
}

parsed_cmds = parseCommandLine(process.argv);
parsed_cmds.forEach((e) => {
  exec(e);
});


/**
 * export json
 * args: --export [cmd_line_args] [.xlsx files list].
 */
function exportJson() {
  try {
    glob(path.join(__dirname, config.xlsx.src), (err, files) => {
      if (err) {
        console.error("exportJson error:", err);
        throw err;
      }
      files.forEach(file => {
        const list = xlsx.parse(file);
        const content = list[0].data;
        const data =[];
        const names = [];
        content.forEach((item, index)=>{
          if(!item[0]){
            console.log(item, index)
          }
            if(index===0) {
                item.forEach((subItem, subIndex)=>{
                    if(subIndex >= 1) {
                        names.push(subItem);
                        data.push({});
                    }
                });
            }
    
            if(index>=1) {
                for(let i = 1,l = item.length; i < l; i++ ) {
                    tool.keys(data[i-1], item[0], item[i]);
                }
            }
        });
        
        // if (!fs.existsSync(path.join(__dirname, 'static/lang'))) {
        //   fs.mkdirSync(path.join(__dirname, 'static/lang'));
        // }

        data.forEach((item, index)=>{
            const oneName = names[index].split('/');
            const msg = `${JSON.stringify(item, null, 4)}`;
            if (!oneName[1]) {
                console.log(`----语言标题应该用 / 分隔，请修改后重新生成----`);
                return;
            }
            fs.writeFile(path.join(__dirname, '../../assets/resources/lang/' + oneName[1]+'.json'), msg, (err) => {
               if (err) console.log('----------------------发生错误', err);
            });
        });
        
        console.log("result: 转成完成");
      });

    });
    
  } catch (error) {
      console.log('----------------------发生错误', error);
      
  }
}

/**
 * export json
 * args: --export [cmd_line_args] [dir].
 */
function exportDirJson(args) {
  glob(path.join(__dirname, args[0], '**/[^~$]*.xlsx'), (err, files) => {
    if (err) {
      console.error("exportJson error:", err);
      throw err;
    }
    files.forEach(item => {
      xlsx.toJson(item, path.join(__dirname, config.xlsx.dest));
    });
  });
}

/**
 * show help
 */
function showHelp() {
  let usage = "usage: \n";
  for (const p in commands) {
    if (typeof commands[p] !== "function") {
      usage += "\t " + p + "\t " + commands[p].alias + "\t " + commands[p].desc + "\n ";
    }
  }

  usage += "\nexamples: ";
  usage += "\n\n $node index.js --export\n\tthis will export all files configed to json.";
  usage += "\n\n $node index.js --export ./excel/foo.xlsx ./excel/bar.xlsx\n\tthis will export foo and bar xlsx files.";

  console.log(usage);
}


/** ************************** parse command line ******************************** */

/**
 * execute a command
 */
function exec(cmd) {
  if (typeof cmd.action === "function") {
    cmd.action(cmd.args);
  }
}


/**
 * parse command line args
 */
function parseCommandLine(args) {

  const parsed_cmds = [];

  if (args.length <= 2) {
    parsed_cmds.push(defaultCommand());
  } else {

    const cli = args.slice(2);

    let pos = 0;
    let cmd;

    cli.forEach((element, index, array) => {

      // replace alias name with real name.
      if (element.indexOf('--') === -1 && element.indexOf('-') === 0) {
        cli[index] = alias_map[element];
      }

      // parse command and args
      if (cli[index].indexOf('--') === -1) {
        cmd.args.push(cli[index]);
      } else {

        if (keys[cli[index]] === "undefined") {
          throw new Error("not support command:" + cli[index]);
        }

        pos = index;
        cmd = commands[cli[index]];
        if (typeof cmd.args === 'undefined') {
          cmd.args = [];
        }
        parsed_cmds.push(cmd);
      }
    });
  }

  return parsed_cmds;
}

/**
 * default command when no command line argas provided.
 */
function defaultCommand() {
  if (keys.length <= 0) {
    throw new Error("Error: there is no command at all!");
  }

  for (const p in commands) {
    if (commands[p]["default"]) {
      return commands[p];
    }
  }

  if (keys["--help"]) {
    return commands["--help"];
  } 
    return commands[keys[0]];
  
}

/** ********************************************************************** */