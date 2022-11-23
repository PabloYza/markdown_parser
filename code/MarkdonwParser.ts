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

interface IVisitor {
  Visit(token: ParseElement, markdownDocument: IMarkdownDocument): void;
}

interface IVisitable {
  Accept(
    visitor: IVisitor,
    token: ParseElement,
    markdownDocument: IMarkdownDocument
  ): void;
}

// when visit is called cal <TagTypeToHtml()> to format text
abstract class VisitorBase implements IVisitor {
  constructor(
    private readonly tagType: TagType,
    private readonly TagTypeToHtml: TagTypeToHtml
  ) {}
  Visit(token: ParseElement, markdownDocument: IMarkdownDocument): void {
    markdownDocument.Add(
      this.TagTypeToHtml.OpeningTag(this.tagType),
      token.CurrentLine,
      this.TagTypeToHtml.ClosingTag(this.tagType)
    );
  }
}

// visitor implementations
class Header1Visitor extends VisitorBase {
  constructor() {
    super(TagType.Header1, new TagTypeToHtml());
  }
}

class Header2Visitor extends VisitorBase {
  constructor() {
    super(TagType.Header2, new TagTypeToHtml());
  }
}
class Header3Visitor extends VisitorBase {
  constructor() {
    super(TagType.Header3, new TagTypeToHtml());
  }
}
class ParagraphVisitor extends VisitorBase {
  constructor() {
    super(TagType.Paragraph, new TagTypeToHtml());
  }
}
class HorizontalRuleVisitor extends VisitorBase {
  constructor() {
    super(TagType.HorizontalRule, new TagTypeToHtml());
  }
}

class Visitable implements IVisitable {
  Accept(
    visitor: IVisitor,
    token: ParseElement,
    markdownDocument: IMarkdownDocument
  ): void {
    visitor.Visit(token, markdownDocument);
  }
}

/* Chain-of-responsability pattern */

abstract class Handler<T> {
  protected next: Handler<T> | null = null;
  public SetNext(next: Handler<T>): void {
    this.next = next;
  }
  public HandleRequest(request: T): void {
    if (!this.CanHandle(request)) {
      if (this.next !== null) {
        this.next.HandleRequest(request);
      }
      return;
    }
  }
  protected abstract CanHandle(request: T): boolean;
}

class ParseChainHandler extends Handler<ParseElement> {
  private readonly visitable: IVisitable = new Visitable();
  protected CanHandle(request: ParseElement): boolean {
    let split = new LineParser().Parse(request.CurrentLine, this.tagType);
    if (split[0]) {
      request.CurrentLine = split[1];
      this.visitable.Accept(this.visitor, request, this.document);
    }
    return split[0];
  }
  constructor(
    private readonly document: IMarkdownDocument,
    private readonly tagType: string,
    private readonly visitor: IVisitor
  ) {
    super();
  }
}

class LineParser {
  public Parse(value: string, tag: string): [boolean, string] {
    let output: [boolean, string] = [false, ""];
    output[1] = value;
    if (value === "") {
      return output;
    }
    let split = value.startsWith(`${tag}`);
    if (split) {
      output[0] = true;
      output[1] = value.substring(tag.length);
    }
    return output;
  }
}

class ParagraphHandler extends Handler<ParseElement> {
  private readonly visitable: IVisitable = new Visitable();
  private readonly visitor: IVisitor = new ParagraphVisitor();
  protected CanHandle(request: ParseElement): boolean {
    this.visitable.Accept(this.visitor, request, this.document);
    return true;
  }
  constructor(private readonly document: IMarkdownDocument) {
    super();
  }
}

class Header1ChainHandler extends ParseChainHandler {
  constructor(document : IMarkdownDocument) {
    super(document, "# ", new Header1Visitor())
  }
}

class Header2ChainHandler extends ParseChainHandler {
  constructor(document : IMarkdownDocument) {
    super(document, "## ", new Header2Visitor())
  }
}
class Header3ChainHandler extends ParseChainHandler {
  constructor(document : IMarkdownDocument) {
    super(document, "### ", new Header3Visitor())
  }
}

class HorizontalRuleHandler extends ParseChainHandler {
  constructor(document : IMarkdownDocument) {
    super(document, '---', new HorizontalRuleVisitor())
  }
}

class ChainOfResponsabilityFactory {
  Build(document : IMarkdownDocument) : ParseChainHandler {
    let header1 : Header1ChainHandler = new Header1ChainHandler(document)
    let header2 : Header2ChainHandler = new Header2ChainHandler(document)
    let header3 : Header3ChainHandler = new Header3ChainHandler(document)
    let horizontalRule : HorizontalRuleHandler = new HorizontalRuleHandler(document)
    let paragraph : ParagraphHandler = new ParagraphHandler(document)

    header1.SetNext(header2)
    header2.SetNext(header3)
    header3.SetNext(horizontalRule)
    horizontalRule.SetNext(paragraph)

    return header1
  }
}