import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQ() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-8">Preguntas Frecuentes</h2>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-lg font-medium">¿Es seguro el pago en esta plataforma?</AccordionTrigger>
          <AccordionContent className="text-gray-600">
            Sí, todos nuestros métodos de pago son completamente seguros. Puede recargar con saldo o realizar pagos a
            través de PayU con cualquier tipo de tarjeta (débito o crédito). Utilizamos encriptación de última
            generación para proteger su información financiera.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger className="text-lg font-medium">
            ¿Puedo hacer cambios en mi pedido después de realizarlo?
          </AccordionTrigger>
          <AccordionContent className="text-gray-600">
            Depende del artículo. Para algunos productos es posible realizar modificaciones dentro de las primeras 24
            horas después de la compra. Le recomendamos contactar a nuestro servicio al cliente lo antes posible si
            necesita hacer algún cambio en su pedido.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger className="text-lg font-medium">¿Cuál es la política de garantía?</AccordionTrigger>
          <AccordionContent className="text-gray-600">
            Todos nuestros productos cuentan con 7 días de garantía desde la fecha de entrega. Si su producto presenta
            algún defecto de fábrica o no funciona correctamente, puede solicitar un reemplazo o devolución dentro de
            este período. Para hacer efectiva la garantía, deberá presentar su comprobante de compra y el producto en su
            empaque original.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
