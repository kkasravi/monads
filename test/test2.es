module a {
   import {x:y} from b;
   module b{
      export let y = x;  //essentially this is let y=y
    }
}
