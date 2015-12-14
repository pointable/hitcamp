
var _ = require('underscore');


var adjectives = [
    "adorable"
    , "adventurous"
    , "alert"
    , "attractive"
    , "beautiful"
    , "blue-eyed "
    , "blushing"
    , "bright"
    , "clean"
    , "clear"
    , "cloudy"
    , "colorful"
    , "crowded"
    , "cute"
    , "dark"
    , "distinct"
    , "dull"
    , "elegant"
    , "excited"
    , "fancy"
    , "filthy"
    , "glamorous"
    , "gleaming"
    , "gorgeous"
    , "graceful"
    , "handsome"
    , "homely"
    , "light"
    , "long"
    , "magnificent"
    , "misty"
    , "plain"
    , "poised"
    , "precious"
    , "quaint"
    , "shiny"
    , "sparkling"
    , "spotless"
    , "stormy"
    , "strange"
    , "unusual"
    , "wide-eyed "
    , "alive"
    , "bad"
    , "better"
    , "beautiful"
    , "brainy"
    , "breakable"
    , "busy"
    , "careful"
    , "cautious"
    , "clever"
    , "concerned"
    , "curious"
    , "different"
    , "doubtful"
    , "easy"
    , "famous"
    , "gifted"
    , "helpful"
    , "important"
    , "impossible"
    , "inexpensive"
    , "innocent"
    , "inquisitive"
    , "modern"
    , "mushy"
    , "open"
    , "outstanding"
    , "powerful"
    , "prickly"
    , "puzzled"
    , "real"
    , "rich"
    , "sleepy"
    , "super"
    , "talented"
    , "tame"
    , "tender"
    , "tough"
    , "vast"
    , "wandering"
    , "wild"
    , "wrong"
    , "agreeable"
    , "amused"
    , "brave"
    , "calm"
    , "charming"
    , "cheerful"
    , "comfortable"
    , "cooperative"
    , "courageous"
    , "delightful"
    , "determined"
    , "eager"
    , "elated"
    , "enchanting"
    , "encouraging"
    , "energetic"
    , "enthusiastic"
    , "excited"
    , "exuberant"
    , "fair"
    , "faithful"
    , "fantastic"
    , "fine"
    , "friendly"
    , "funny"
    , "gentle"
    , "glorious"
    , "good"
    , "happy"
    , "healthy"
    , "helpful"
    , "hilarious"
    , "jolly"
    , "joyous"
    , "kind"
    , "lively"
    , "lovely"
    , "lucky"
    , "nice"
    , "obedient"
    , "perfect"
    , "pleasant"
    , "proud"
    , "relieved"
    , "silly"
    , "smiling"
    , "splendid"
    , "successful"
    , "thankful"
    , "thoughtful"
    , "victorious"
    , "witty"
    , "wonderful"
    , "zealous"
];

var animals = [
  "alligator",
  "ant",
  "anteater",
  "antelope",
  "ape",
  "armadillo",
  "herd",
  "baboon",
  "badger",
  "barracuda",
  "bat",
  "bear",
  "beaver",
  "bee",
  "bison",
  "boar",
  "galago",
  "butterfly",
  "camel",
  "caribou",
  "cat",
  "caterpillar",
  "cattle",
  "chamois",
  "cheetah",
  "chicken",
  "chimpanzee",
  "chinchilla",
  "clam",
  "cobra",
  "cockroach",
  "cod",
  "cormorant",
  "coyote",
  "crab",
  "herd",
  "crocodile",
  "crow",
  "curlew",
  "deer",
  "dinosaur",
  "dog",
  "dolphin",
  "donkey",
  "dove",
  "dragonfly",
  "duck",
  "dugong",
  "eagle",
  "eel",
  "elephant",
  "elk",
  "emu",
  "falcon",
  "ferret",
  "finch",
  "fish",
  "flamingo",
  "fly",
  "fox",
  "frog",
  "gaur",
  "gazelle",
  "gerbil",
  "giraffe",
  "gnat",
  "goat",
  "goose",
  "goldfish",
  "gorilla",
  "goshawk",
  "grasshopper",
  "grouse",
  "guanaco",
  "poultry",
  "herd",
  "gull",
  "hamster",
  "hare",
  "hawk",
  "hedgehog",
  "heron",
  "herring",
  "hippopotamus",
  "hornet",
  "horse",
  "human",
  "hummingbird",
  "hyena",
  "jackal",
  "jaguar",
  "jellyfish",
  "kangaroo",
  "koala",
  "kouprey",
  "kudu",
  "lapwing",
  "lark",
  "lemur",
  "leopard",
  "lion",
  "llama",
  "lobster",
  "locust",
  "loris",
  "louse",
  "lyrebird",
  "magpie",
  "mallard",
  "manatee",
  "marten",
  "meerkat",
  "mink",
  "monkey",
  "moose",
  "mouse",
  "mosquito",
  "mule",
  "narwhal",
  "newt",
  "nightingale",
  "octopus",
  "okapi",
  "opossum",
  "oryx",
  "ostrich",
  "otter",
  "owl",
  "ox",
  "oyster",
  "parrot",
  "partridge",
  "peafowl",
  "pelican",
  "penguin",
  "pheasant",
  "pig",
  "pigeon",
  "pony",
  "porcupine",
  "porpoise",
  "quail",
  "rabbit",
  "raccoon",
  "rat",
  "raven",
  "herd",
  "reindeer",
  "rhinoceros",
  "ruff",
  "salamander",
  "salmon",
  "sandpiper",
  "sardine",
  "scorpion",
  "herd",
  "seahorse",
  "shark",
  "sheep",
  "shrew",
  "shrimp",
  "skunk",
  "snail",
  "snake",
  "spider",
  "squid",
  "squirrel",
  "starling",
  "stingray",
  "stork",
  "swallow",
  "swan",
  "tapir",
  "tarsier",
  "termite",
  "tiger",
  "toad",
  "trout",
  "poultry",
  "turtle",
  "vulture",
  "wallaby",
  "walrus",
  "wasp",
  "weasel",
  "whale",
  "wolf",
  "wolverine",
  "wombat",
  "woodcock",
  "woodpecker",
  "worm",
  "wren",
  "yak",
  "zebra"
];


function capitaliseFirstLetter(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

//function App() {
GenerateName = function() {
  var adjectiveChosen = capitaliseFirstLetter(_.sample(adjectives));
  var animalChosen = capitaliseFirstLetter(_.sample(animals));

  return adjectiveChosen + " " + animalChosen;
};
//};


module.exports.GenerateName = GenerateName;