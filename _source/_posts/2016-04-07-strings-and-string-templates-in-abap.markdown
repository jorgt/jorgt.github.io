---
title: Strings and string templates in ABAP
category: development
tags: [abap, sap, strings]
excerpt: String functions and String templates in ABAP 731 and 740
description: String functions and String templates in ABAP 731 and 740
---

Having done a ton of ABAP over the years in NW 700, 701 and 702 systems, upgrading to 740 was a revelation in terms of improvements in syntax. So much so I wanted to write about a few of the things I've found out the last couple of months. I know I'm a bit late to the party with this but now I'm excited. First up: string templates. 

## The old strings

Up until recently, I had to do string using the `CONCATENATE` keyword. It has special syntax for separators and a few other things:

{% highlight abap %}
DATA my_variable TYPE string.
DATA my_name TYPE string VALUE 'Jorg'.

" this results in "Hello Jorg"
CONCATENATE 'Hello' my_name INTO my_variable SEPARATED BY SPACE.

" so does this:
CONCATENATE 'Hello ' my_name INTO my_variable RESPECTING BLANKS.

" and the same using string literals
CONCATENATE `Hello ` my_name INTO my_variable.
{% endhighlight %}

## Strings since ABAP 7.31

Release 7.31 had a few string related changes that made working with them a lot more flexible, and a lot less cumbersome. 

#### Chaining operator

The main reason never to use `CONCATENATE` again is the chaining operator: `&&`. This means we can now add strings together like this:

{% highlight abap %}
DATA my_variable TYPE string.
DATA my_name TYPE string VALUE 'Jorg'.

" this results in "Hello Jorg"
my_variable = `Hello ` && my_name.
{% endhighlight %} 

This should not be confused with the **literal operator**, `&`, which has a similar but has a rather different implementation. Where the chaining operator is checked at run time, the literal operator is checked at compile time, and is limited to concatenating strings up to 255 characters in length. Compile time means it's evaluated only once, when the program is activated. It's a remnant of the days when ABAP code editor was limited to 72 characters per line.

#### String templates

This one is great. You can recognize a string template when you see code between two pipes: `|...|`. String templates make string manipulation with variables, calculations or filters a lot easier. There are three components that can be used with a string template:

- Embedded expressions
- Control characters
- Literal text

###### Embedded expressions

An embedded expression is the inclusion of code in a string template. This can be a variable, the return value of a function, a table expression... almost anything as long as it contains a text-like value. Expressions are found between curly brackets, inside the template's pipes: `|{ my_variable }|`. There's also a host of formatting options available. See all formatting options [here](//help.sap.com/abapdocu_731/en/abapcompute_string_format_options.htm).

###### Control characters

The characters indicating line breaks, carriage returns or tabs: `\n\r\t`

###### Literal text

This can be any string as long as it does not have any characters reserved for the embedded expressions or control characters, in which case they'll have to be escaped: `|including a \{ bracket|`.

###### Examples

{% highlight abap %}
REPORT zzjt_test.

"setting up a class
CLASS my_class DEFINITION. PUBLIC SECTION.METHODS:date RETURNING VALUE(d) TYPE datum.ENDCLASS.


"setting some data: one string, one number, and one internal table.
DATA(my_variable) = 'string'.
DATA(my_number) = 10.
DATA(my_string) = NEW my_class( ).
SELECT * FROM t000 INTO TABLE @DATA(clients).


"these are all valid string templates and expressions.

START-OF-SELECTION.
  TRY.
      WRITE: /   |string|.
      WRITE: /   |{ my_variable }|.
      WRITE: /   |i'm a { my_variable }!|.
      WRITE: /   |i'm number { my_number * 10 }!| .
      WRITE: /   |client 000 is called: | &&
                 |{ clients[ mandt = '000' ]-mtext }|.
      WRITE: /   |i'm going to be in upper case: | &&
                 |{ my_variable CASE = UPPER }|.
      WRITE: /   |function and formatting:| &&
                 | date raw - { my_string->date( ) DATE = RAW }| &&
                 | date iso - { my_string->date( ) DATE = ISO }|.

    CATCH cx_root.

  ENDTRY.

  CLASS my_class IMPLEMENTATION.METHOD date. d = sy-datum.ENDMETHOD.ENDCLASS.
{% endhighlight %} 

This results in:

{% highlight text %}
string
string
i'm a string!
i'm number 100!
client 000 is called: SAP AG
i'm going to be in upper case: STRING
function and formatting: date raw - 20160408 date iso - 2016-04-08
{% endhighlight %}

## Conclusion

The string templates and expressions are brilliant. Combined with the inline declarations that were introduced in ABAP 740, this is going to save me a ton of code and therefore, time. 
