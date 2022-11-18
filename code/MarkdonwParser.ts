class HtmlHandler {
  public TextChangeHandler(id: string, output: string): void {
    let markdown = <HTMLTextAreaElement>document.getElementById(id);
    let markdownOutput = <HTMLLabelElement>document.getElementById(output);
    if (markdown !== null) {
      markdown.onkeyup = (e) => {
        if (markdown.value) {
          markdownOutput.innerHTML = markdown.value;
        } else markdownOutput.innerHTML = "<p></p>";
      };
    }
    markdownOutput.innerHTML = "<p>Waiting for text . . .</p>";
  }
}

enum TagType {
  Paragraph,
  Header1,
  Header2,
  Header3,
  HorizontalRule,
}

class TagTypeToHtml {
  private readonly tagType: Map<TagType, string> = new Map<TagType, string>();
  constructor() {
    this.tagType.set(TagType.Header1, "h1");
    this.tagType.set(TagType.Header2, "h2");
    this.tagType.set(TagType.Header3, "h3");
    this.tagType.set(TagType.Paragraph, "p");
    this.tagType.set(TagType.HorizontalRule, "hr");
  }

  public OpeningTag(tagType: TagType): string {
    return this.GetTag(tagType, "<");
  }

  public ClosingTag(tagType: TagType): string {
    return this.GetTag(tagType, "</");
  }

  private GetTag(tagType: TagType, openingTagPattern: string): string {
    let tag = this.tagType.get(tagType);
    if (tag !== null) {
      return `${openingTagPattern}${tag}`;
    }
    return `${openingTagPattern}p>`;
  }
}

// Markdown doc

interface IMarkdownDocument {
  Add(...content: string[]): void;
  Get(): string;
}

class MarkdownDocument implements IMarkdownDocument {
  private content: string = " ";
  Add(...content: string[]): void {
    content.forEach((element) => {
      this.content += element;
    });
  }
  Get(): string {
    return this.content;
  }
}

class ParseElement {
  CurrentLine: string = "";
}

/*  Visitor pattern */

interface IVistor {
  Visit(token: ParseElement, markdownDocument: IMarkdownDocument): void;
}

interface IVisitable {
  Accept(
    visitor: IVistor,
    token: ParseElement,
    markdownDocument: IMarkdownDocument
  ): void;
}

// when visit is called cal <TagTypeToHtml()> to format text 
abstract class VisitorBase implements IVistor {
  constructor(private readonly tagType: TagType, private readonly TagTypeToHtml : TagTypeToHtml) {}
  Visit(token: ParseElement, markdownDocument: IMarkdownDocument): void {
    markdownDocument.Add(this.TagTypeToHtml.OpeningTag(this.tagType), token.CurrentLine, this.TagTypeToHtml.ClosingTag(this.tagType))
  }
}

// visitor implementations
class Header1Visitor extends VisitorBase {
  constructor() {
    super(TagType.Header1, new TagTypeToHtml())
  }
}

class Header2Visitor extends VisitorBase {
  constructor() {
    super(TagType.Header2, new TagTypeToHtml())
  }
}
class Header3Visitor extends VisitorBase {
  constructor() {
    super(TagType.Header3, new TagTypeToHtml())
  }
}
class ParagraphVisitor extends VisitorBase {
  constructor() {
    super(TagType.Paragraph, new TagTypeToHtml())
  }
}
class HorizontalRuleVisitor extends VisitorBase {
  constructor() {
    super(TagType.HorizontalRule, new TagTypeToHtml())
  }
}

class Visitable implements IVisitable {
  Accept(visitor: IVistor, token: ParseElement, markdownDocument: IMarkdownDocument): void {
    visitor.Visit(token, markdownDocument)
  }
}