export default function CustomElement(tagName: string, extend?: keyof HTMLElementTagNameMap) {
  return (target: CustomElementConstructor, _ctx: ClassDecoratorContext) => {
    customElements.define(tagName, target, extend ? { extends: extend } : undefined);
  };
}