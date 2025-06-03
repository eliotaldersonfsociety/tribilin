"use client";
import { useEffect, useState } from "react";
import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function CommentsPage({ averageRating }: { averageRating: number }) {
  // Array de 100 comentarios aleatorios
  const randomComments = [
    {
      id: 1,
      name: "María G.",
      date: "15 May 2023",
      title: "Excelente producto, superó mis expectativas",
      comment:
        "¡Este producto cambió mi vida! Lo recomiendo totalmente a todos mis amigos. La calidad es excepcional y el envío fue muy rápido.",
      rating: 5,
      verified: true,
    },
    {
      id: 2,
      name: "Juan R.",
      date: "3 May 2023",
      title: "Buena relación calidad-precio",
      comment:
        "La atención al cliente fue excelente. Resolvieron mi problema en minutos. El producto funciona como se describe.",
      rating: 4,
      verified: true,
    },
    {
      id: 3,
      name: "Ana M.",
      date: "28 Abr 2023",
      title: "Muy satisfecha con mi compra",
      comment:
        "Increíble experiencia de usuario. La interfaz es intuitiva y fácil de usar. Definitivamente compraré más productos de esta marca.",
      rating: 5,
      verified: true,
    },
    {
      id: 4,
      name: "Carlos L.",
      date: "15 Abr 2023",
      title: "Cumple con lo básico",
      comment:
        "Estoy satisfecho con los resultados. Definitivamente volveré a utilizar este servicio, aunque hay algunos detalles que podrían mejorar.",
      rating: 3,
      verified: false,
    },
    {
      id: 5,
      name: "Laura S.",
      date: "2 Abr 2023",
      title: "Buen producto, envío rápido",
      comment:
        "La relación calidad-precio es inmejorable. Vale cada centavo invertido. Llegó antes de lo esperado y en perfectas condiciones.",
      rating: 4,
      verified: true,
    },
    {
      id: 6,
      name: "Pedro V.",
      date: "28 Mar 2023",
      title: "No cumplió con mis expectativas",
      comment:
        "El producto llegó con algunos defectos. La atención al cliente fue buena y me ofrecieron un reembolso, pero esperaba mejor calidad.",
      rating: 2,
      verified: true,
    },
    {
      id: 7,
      name: "Sofía H.",
      date: "25 Mar 2023",
      title: "Perfecto para mis necesidades",
      comment:
        "Exactamente lo que estaba buscando. Funciona perfectamente y el precio es muy razonable. Lo recomendaría sin dudarlo.",
      rating: 5,
      verified: true,
    },
    {
      id: 8,
      name: "Miguel A.",
      date: "20 Mar 2023",
      title: "Buen producto pero envío lento",
      comment:
        "El producto en sí es bueno, pero tardó más de lo esperado en llegar. Casi cancelo el pedido por la demora.",
      rating: 3,
      verified: true,
    },
    {
      id: 9,
      name: "Carmen D.",
      date: "15 Mar 2023",
      title: "Calidad excepcional",
      comment:
        "Nunca había probado algo así. La calidad es impresionante y el servicio al cliente es de primera. Definitivamente repetiré.",
      rating: 5,
      verified: true,
    },
    {
      id: 10,
      name: "Roberto F.",
      date: "10 Mar 2023",
      title: "Decepcionante",
      comment:
        "No funciona como esperaba. Las instrucciones no son claras y el soporte técnico no fue de ayuda. No lo recomendaría.",
      rating: 1,
      verified: true,
    },
    {
      id: 11,
      name: "Elena P.",
      date: "5 Mar 2023",
      title: "Sorprendentemente bueno",
      comment:
        "No esperaba mucho por el precio, pero me ha sorprendido gratamente. Funciona perfectamente y es muy fácil de usar.",
      rating: 5,
      verified: false,
    },
    {
      id: 12,
      name: "Javier M.",
      date: "28 Feb 2023",
      title: "Bueno, pero podría ser mejor",
      comment:
        "Cumple con su función básica, pero le faltan algunas características que otros productos similares sí tienen.",
      rating: 3,
      verified: true,
    },
    {
      id: 13,
      name: "Isabel R.",
      date: "25 Feb 2023",
      title: "Excelente servicio",
      comment:
        "El producto es bueno, pero lo que realmente destaca es el servicio al cliente. Muy atentos y resolutivos.",
      rating: 4,
      verified: true,
    },
    {
      id: 14,
      name: "Fernando T.",
      date: "20 Feb 2023",
      title: "No lo recomendaría",
      comment:
        "Mala calidad y peor servicio. No responden a las consultas y el producto se estropeó a las dos semanas.",
      rating: 1,
      verified: false,
    },
    {
      id: 15,
      name: "Lucía G.",
      date: "15 Feb 2023",
      title: "Perfecto para regalo",
      comment: "Lo compré como regalo y fue un éxito. El empaquetado es muy bonito y el producto de gran calidad.",
      rating: 5,
      verified: true,
    },
    {
      id: 16,
      name: "Antonio S.",
      date: "10 Feb 2023",
      title: "Buena compra",
      comment:
        "Relación calidad-precio muy buena. No es el mejor del mercado pero cumple perfectamente con lo que promete.",
      rating: 4,
      verified: true,
    },
    {
      id: 17,
      name: "Marta L.",
      date: "5 Feb 2023",
      title: "Increíble hallazgo",
      comment: "Llevaba tiempo buscando algo así. Es perfecto para mis necesidades y a un precio muy competitivo.",
      rating: 5,
      verified: true,
    },
    {
      id: 18,
      name: "David R.",
      date: "31 Ene 2023",
      title: "Decente, pero esperaba más",
      comment: "No está mal, pero por el precio que tiene esperaba algo mejor. Cumple su función pero sin destacar.",
      rating: 3,
      verified: true,
    },
    {
      id: 19,
      name: "Cristina M.",
      date: "28 Ene 2023",
      title: "Compra repetida",
      comment: "Ya es la tercera vez que lo compro. Eso lo dice todo. Calidad constante y buen servicio.",
      rating: 5,
      verified: true,
    },
    {
      id: 20,
      name: "Pablo A.",
      date: "25 Ene 2023",
      title: "Mala experiencia",
      comment: "El producto vino defectuoso y tardaron semanas en responder a mi reclamación. No volveré a comprar.",
      rating: 1,
      verified: true,
    },
    {
      id: 21,
      name: "Natalia V.",
      date: "20 Ene 2023",
      title: "Muy recomendable",
      comment:
        "Excelente producto a un precio justo. La entrega fue rápida y el producto llegó en perfectas condiciones.",
      rating: 5,
      verified: true,
    },
    {
      id: 22,
      name: "Sergio P.",
      date: "15 Ene 2023",
      title: "Buen producto, mal servicio",
      comment: "El producto en sí es bueno, pero el servicio post-venta deja mucho que desear. Tardan en responder.",
      rating: 3,
      verified: false,
    },
    {
      id: 23,
      name: "Raquel F.",
      date: "10 Ene 2023",
      title: "Mejor de lo esperado",
      comment: "Superó mis expectativas en todos los aspectos. Calidad, durabilidad y diseño excelentes.",
      rating: 5,
      verified: true,
    },
    {
      id: 24,
      name: "Jorge L.",
      date: "5 Ene 2023",
      title: "Calidad aceptable",
      comment: "No es el mejor que he probado, pero cumple bien con su función. Relación calidad-precio correcta.",
      rating: 4,
      verified: true,
    },
    {
      id: 25,
      name: "Alicia R.",
      date: "31 Dic 2022",
      title: "Excelente compra",
      comment: "Muy satisfecha con mi compra. Funciona perfectamente y el diseño es muy elegante.",
      rating: 5,
      verified: true,
    },
    {
      id: 26,
      name: "Daniel M.",
      date: "28 Dic 2022",
      title: "No lo recomiendo",
      comment: "Mala calidad y pésimo servicio al cliente. No responden a las reclamaciones.",
      rating: 1,
      verified: false,
    },
    {
      id: 27,
      name: "Eva S.",
      date: "25 Dic 2022",
      title: "Regalo perfecto",
      comment: "Lo compré como regalo de Navidad y fue todo un acierto. Muy buena calidad y presentación.",
      rating: 5,
      verified: true,
    },
    {
      id: 28,
      name: "Adrián G.",
      date: "20 Dic 2022",
      title: "Buena relación calidad-precio",
      comment: "No es el más barato, pero la calidad justifica el precio. Muy satisfecho con la compra.",
      rating: 4,
      verified: true,
    },
    {
      id: 29,
      name: "Beatriz T.",
      date: "15 Dic 2022",
      title: "Decepcionante",
      comment: "No cumple con lo que promete. La calidad es inferior a lo que muestran las fotos.",
      rating: 2,
      verified: true,
    },
    {
      id: 30,
      name: "Víctor H.",
      date: "10 Dic 2022",
      title: "Excelente producto",
      comment: "Uno de los mejores productos que he comprado. Funciona perfectamente y es muy duradero.",
      rating: 5,
      verified: true,
    },
    {
      id: 31,
      name: "Marina C.",
      date: "5 Dic 2022",
      title: "Buen producto",
      comment: "Cumple con lo que promete. No es extraordinario pero hace bien su función.",
      rating: 4,
      verified: true,
    },
    {
      id: 32,
      name: "Rubén D.",
      date: "30 Nov 2022",
      title: "No vale lo que cuesta",
      comment: "Demasiado caro para la calidad que ofrece. Hay alternativas mejores por el mismo precio.",
      rating: 2,
      verified: false,
    },
    {
      id: 33,
      name: "Silvia P.",
      date: "25 Nov 2022",
      title: "Muy satisfecha",
      comment: "Excelente producto y servicio. Llegó antes de lo esperado y en perfectas condiciones.",
      rating: 5,
      verified: true,
    },
    {
      id: 34,
      name: "Alberto M.",
      date: "20 Nov 2022",
      title: "Buena compra",
      comment: "Relación calidad-precio muy buena. Funciona como esperaba y el envío fue rápido.",
      rating: 4,
      verified: true,
    },
    {
      id: 35,
      name: "Nuria F.",
      date: "15 Nov 2022",
      title: "Increíble",
      comment: "Uno de los mejores productos que he comprado. Calidad excepcional y muy fácil de usar.",
      rating: 5,
      verified: true,
    },
    {
      id: 36,
      name: "Óscar L.",
      date: "10 Nov 2022",
      title: "Aceptable",
      comment: "No está mal, pero tampoco es extraordinario. Cumple con lo básico sin más.",
      rating: 3,
      verified: true,
    },
    {
      id: 37,
      name: "Teresa R.",
      date: "5 Nov 2022",
      title: "Muy recomendable",
      comment: "Excelente calidad y servicio. El producto llegó en perfectas condiciones y antes de lo esperado.",
      rating: 5,
      verified: true,
    },
    {
      id: 38,
      name: "Gonzalo S.",
      date: "31 Oct 2022",
      title: "No cumplió expectativas",
      comment: "Esperaba más por el precio que pagué. La calidad es inferior a lo que muestran las imágenes.",
      rating: 2,
      verified: false,
    },
    {
      id: 39,
      name: "Mónica V.",
      date: "28 Oct 2022",
      title: "Excelente compra",
      comment: "Muy satisfecha con mi compra. El producto es de gran calidad y el servicio impecable.",
      rating: 5,
      verified: true,
    },
    {
      id: 40,
      name: "Ignacio M.",
      date: "25 Oct 2022",
      title: "Buen producto",
      comment: "Cumple con lo que promete. La relación calidad-precio es muy buena.",
      rating: 4,
      verified: true,
    },
    {
      id: 41,
      name: "Lorena G.",
      date: "20 Oct 2022",
      title: "No lo recomendaría",
      comment: "Mala calidad y pésimo servicio al cliente. No responden a las reclamaciones.",
      rating: 1,
      verified: true,
    },
    {
      id: 42,
      name: "Héctor P.",
      date: "15 Oct 2022",
      title: "Muy bueno",
      comment: "Excelente producto a un precio razonable. Muy satisfecho con mi compra.",
      rating: 5,
      verified: true,
    },
    {
      id: 43,
      name: "Diana L.",
      date: "10 Oct 2022",
      title: "Buena relación calidad-precio",
      comment: "No es el más barato, pero la calidad justifica el precio. Recomendable.",
      rating: 4,
      verified: false,
    },
    {
      id: 44,
      name: "Andrés R.",
      date: "5 Oct 2022",
      title: "Excelente",
      comment: "Uno de los mejores productos que he comprado. Calidad excepcional y muy fácil de usar.",
      rating: 5,
      verified: true,
    },
    {
      id: 45,
      name: "Celia M.",
      date: "30 Sep 2022",
      title: "Decepcionante",
      comment: "No cumple con lo que promete. La calidad es inferior a lo que muestran las fotos.",
      rating: 2,
      verified: true,
    },
    {
      id: 46,
      name: "Raúl S.",
      date: "25 Sep 2022",
      title: "Muy satisfecho",
      comment: "Excelente producto y servicio. Llegó antes de lo esperado y en perfectas condiciones.",
      rating: 5,
      verified: true,
    },
    {
      id: 47,
      name: "Pilar F.",
      date: "20 Sep 2022",
      title: "Buena compra",
      comment: "Relación calidad-precio muy buena. Funciona como esperaba y el envío fue rápido.",
      rating: 4,
      verified: true,
    },
    {
      id: 48,
      name: "Marcos L.",
      date: "15 Sep 2022",
      title: "No vale lo que cuesta",
      comment: "Demasiado caro para la calidad que ofrece. Hay alternativas mejores por el mismo precio.",
      rating: 2,
      verified: false,
    },
    {
      id: 49,
      name: "Susana P.",
      date: "10 Sep 2022",
      title: "Increíble",
      comment: "Uno de los mejores productos que he comprado. Calidad excepcional y muy fácil de usar.",
      rating: 5,
      verified: true,
    },
    {
      id: 50,
      name: "Joaquín M.",
      date: "5 Sep 2022",
      title: "Aceptable",
      comment: "No está mal, pero tampoco es extraordinario. Cumple con lo básico sin más.",
      rating: 3,
      verified: true,
    },
    {
      id: 51,
      name: "Esther G.",
      date: "31 Ago 2022",
      title: "Muy recomendable",
      comment: "Excelente calidad y servicio. El producto llegó en perfectas condiciones y antes de lo esperado.",
      rating: 5,
      verified: true,
    },
    {
      id: 52,
      name: "Alejandro R.",
      date: "28 Ago 2022",
      title: "No cumplió expectativas",
      comment: "Esperaba más por el precio que pagué. La calidad es inferior a lo que muestran las imágenes.",
      rating: 2,
      verified: true,
    },
    {
      id: 53,
      name: "Irene S.",
      date: "25 Ago 2022",
      title: "Excelente compra",
      comment: "Muy satisfecha con mi compra. El producto es de gran calidad y el servicio impecable.",
      rating: 5,
      verified: true,
    },
    {
      id: 54,
      name: "Gabriel M.",
      date: "20 Ago 2022",
      title: "Buen producto",
      comment: "Cumple con lo que promete. La relación calidad-precio es muy buena.",
      rating: 4,
      verified: false,
    },
    {
      id: 55,
      name: "Verónica L.",
      date: "15 Ago 2022",
      title: "No lo recomendaría",
      comment: "Mala calidad y pésimo servicio al cliente. No responden a las reclamaciones.",
      rating: 1,
      verified: true,
    },
    {
      id: 56,
      name: "Hugo P.",
      date: "10 Ago 2022",
      title: "Muy bueno",
      comment: "Excelente producto a un precio razonable. Muy satisfecho con mi compra.",
      rating: 5,
      verified: true,
    },
    {
      id: 57,
      name: "Claudia F.",
      date: "5 Ago 2022",
      title: "Buena relación calidad-precio",
      comment: "No es el más barato, pero la calidad justifica el precio. Recomendable.",
      rating: 4,
      verified: true,
    },
    {
      id: 58,
      name: "Nicolás R.",
      date: "31 Jul 2022",
      title: "Excelente",
      comment: "Uno de los mejores productos que he comprado. Calidad excepcional y muy fácil de usar.",
      rating: 5,
      verified: false,
    },
    {
      id: 59,
      name: "Olga M.",
      date: "28 Jul 2022",
      title: "Decepcionante",
      comment: "No cumple con lo que promete. La calidad es inferior a lo que muestran las fotos.",
      rating: 2,
      verified: true,
    },
    {
      id: 60,
      name: "Emilio S.",
      date: "25 Jul 2022",
      title: "Muy satisfecho",
      comment: "Excelente producto y servicio. Llegó antes de lo esperado y en perfectas condiciones.",
      rating: 5,
      verified: true,
    },
    {
      id: 61,
      name: "Lidia G.",
      date: "20 Jul 2022",
      title: "Buena compra",
      comment: "Relación calidad-precio muy buena. Funciona como esperaba y el envío fue rápido.",
      rating: 4,
      verified: true,
    },
    {
      id: 62,
      name: "Tomás L.",
      date: "15 Jul 2022",
      title: "No vale lo que cuesta",
      comment: "Demasiado caro para la calidad que ofrece. Hay alternativas mejores por el mismo precio.",
      rating: 2,
      verified: false,
    },
    {
      id: 63,
      name: "Aurora P.",
      date: "10 Jul 2022",
      title: "Increíble",
      comment: "Uno de los mejores productos que he comprado. Calidad excepcional y muy fácil de usar.",
      rating: 5,
      verified: true,
    },
    {
      id: 64,
      name: "Ismael M.",
      date: "5 Jul 2022",
      title: "Aceptable",
      comment: "No está mal, pero tampoco es extraordinario. Cumple con lo básico sin más.",
      rating: 3,
      verified: true,
    },
    {
      id: 65,
      name: "Rocío F.",
      date: "30 Jun 2022",
      title: "Muy recomendable",
      comment: "Excelente calidad y servicio. El producto llegó en perfectas condiciones y antes de lo esperado.",
      rating: 5,
      verified: true,
    },
    {
      id: 66,
      name: "Julián R.",
      date: "25 Jun 2022",
      title: "No cumplió expectativas",
      comment: "Esperaba más por el precio que pagué. La calidad es inferior a lo que muestran las imágenes.",
      rating: 2,
      verified: false,
    },
    {
      id: 67,
      name: "Nerea S.",
      date: "20 Jun 2022",
      title: "Excelente compra",
      comment: "Muy satisfecha con mi compra. El producto es de gran calidad y el servicio impecable.",
      rating: 5,
      verified: true,
    },
    {
      id: 68,
      name: "Bruno M.",
      date: "15 Jun 2022",
      title: "Buen producto",
      comment: "Cumple con lo que promete. La relación calidad-precio es muy buena.",
      rating: 4,
      verified: true,
    },
    {
      id: 69,
      name: "Ángela L.",
      date: "10 Jun 2022",
      title: "No lo recomendaría",
      comment: "Mala calidad y pésimo servicio al cliente. No responden a las reclamaciones.",
      rating: 1,
      verified: true,
    },
    {
      id: 70,
      name: "Darío P.",
      date: "5 Jun 2022",
      title: "Muy bueno",
      comment: "Excelente producto a un precio razonable. Muy satisfecho con mi compra.",
      rating: 5,
      verified: false,
    },
    {
      id: 71,
      name: "Miriam G.",
      date: "31 May 2022",
      title: "Buena relación calidad-precio",
      comment: "No es el más barato, pero la calidad justifica el precio. Recomendable.",
      rating: 4,
      verified: true,
    },
    {
      id: 72,
      name: "Samuel R.",
      date: "28 May 2022",
      title: "Excelente",
      comment: "Uno de los mejores productos que he comprado. Calidad excepcional y muy fácil de usar.",
      rating: 5,
      verified: true,
    },
    {
      id: 73,
      name: "Inés M.",
      date: "25 May 2022",
      title: "Decepcionante",
      comment: "No cumple con lo que promete. La calidad es inferior a lo que muestran las fotos.",
      rating: 2,
      verified: true,
    },
    {
      id: 74,
      name: "Álvaro S.",
      date: "20 May 2022",
      title: "Muy satisfecho",
      comment: "Excelente producto y servicio. Llegó antes de lo esperado y en perfectas condiciones.",
      rating: 5,
      verified: false,
    },
    {
      id: 75,
      name: "Noelia F.",
      date: "15 May 2022",
      title: "Buena compra",
      comment: "Relación calidad-precio muy buena. Funciona como esperaba y el envío fue rápido.",
      rating: 4,
      verified: true,
    },
    {
      id: 76,
      name: "Iván L.",
      date: "10 May 2022",
      title: "No vale lo que cuesta",
      comment: "Demasiado caro para la calidad que ofrece. Hay alternativas mejores por el mismo precio.",
      rating: 2,
      verified: true,
    },
    {
      id: 77,
      name: "Carla P.",
      date: "5 May 2022",
      title: "Increíble",
      comment: "Uno de los mejores productos que he comprado. Calidad excepcional y muy fácil de usar.",
      rating: 5,
      verified: true,
    },
    {
      id: 78,
      name: "Adrián M.",
      date: "30 Abr 2022",
      title: "Aceptable",
      comment: "No está mal, pero tampoco es extraordinario. Cumple con lo básico sin más.",
      rating: 3,
      verified: false,
    },
    {
      id: 79,
      name: "Blanca G.",
      date: "25 Abr 2022",
      title: "Muy recomendable",
      comment: "Excelente calidad y servicio. El producto llegó en perfectas condiciones y antes de lo esperado.",
      rating: 5,
      verified: true,
    },
    {
      id: 80,
      name: "Rodrigo R.",
      date: "20 Abr 2022",
      title: "No cumplió expectativas",
      comment: "Esperaba más por el precio que pagué. La calidad es inferior a lo que muestran las imágenes.",
      rating: 2,
      verified: true,
    },
    {
      id: 81,
      name: "Ainhoa S.",
      date: "15 Abr 2022",
      title: "Excelente compra",
      comment: "Muy satisfecha con mi compra. El producto es de gran calidad y el servicio impecable.",
      rating: 5,
      verified: false,
    },
    {
      id: 82,
      name: "Martín M.",
      date: "10 Abr 2022",
      title: "Buen producto",
      comment: "Cumple con lo que promete. La relación calidad-precio es muy buena.",
      rating: 4,
      verified: true,
    },
    {
      id: 83,
      name: "Candela L.",
      date: "5 Abr 2022",
      title: "No lo recomendaría",
      comment: "Mala calidad y pésimo servicio al cliente. No responden a las reclamaciones.",
      rating: 1,
      verified: true,
    },
    {
      id: 84,
      name: "Mateo P.",
      date: "31 Mar 2022",
      title: "Muy bueno",
      comment: "Excelente producto a un precio razonable. Muy satisfecho con mi compra.",
      rating: 5,
      verified: true,
    },
    {
      id: 85,
      name: "Valeria G.",
      date: "28 Mar 2022",
      title: "Buena relación calidad-precio",
      comment: "No es el más barato, pero la calidad justifica el precio. Recomendable.",
      rating: 4,
      verified: false,
    },
    {
      id: 86,
      name: "Leo R.",
      date: "25 Mar 2022",
      title: "Excelente",
      comment: "Uno de los mejores productos que he comprado. Calidad excepcional y muy fácil de usar.",
      rating: 5,
      verified: true,
    },
    {
      id: 87,
      name: "Alma M.",
      date: "20 Mar 2022",
      title: "Decepcionante",
      comment: "No cumple con lo que promete. La calidad es inferior a lo que muestran las fotos.",
      rating: 2,
      verified: true,
    },
    {
      id: 88,
      name: "Unai S.",
      date: "15 Mar 2022",
      title: "Muy satisfecho",
      comment: "Excelente producto y servicio. Llegó antes de lo esperado y en perfectas condiciones.",
      rating: 5,
      verified: true,
    },
    {
      id: 89,
      name: "Lola F.",
      date: "10 Mar 2022",
      title: "Buena compra",
      comment: "Relación calidad-precio muy buena. Funciona como esperaba y el envío fue rápido.",
      rating: 4,
      verified: false,
    },
    {
      id: 90,
      name: "Iker L.",
      date: "5 Mar 2022",
      title: "No vale lo que cuesta",
      comment: "Demasiado caro para la calidad que ofrece. Hay alternativas mejores por el mismo precio.",
      rating: 2,
      verified: true,
    },
    {
      id: 91,
      name: "Abril P.",
      date: "28 Feb 2022",
      title: "Increíble",
      comment: "Uno de los mejores productos que he comprado. Calidad excepcional y muy fácil de usar.",
      rating: 5,
      verified: true,
    },
    {
      id: 92,
      name: "Izan M.",
      date: "25 Feb 2022",
      title: "Aceptable",
      comment: "No está mal, pero tampoco es extraordinario. Cumple con lo básico sin más.",
      rating: 3,
      verified: false,
    },
    {
      id: 93,
      name: "Vera G.",
      date: "20 Feb 2022",
      title: "Muy recomendable",
      comment: "Excelente calidad y servicio. El producto llegó en perfectas condiciones y antes de lo esperado.",
      rating: 5,
      verified: true,
    },
    {
      id: 94,
      name: "Nil R.",
      date: "15 Feb 2022",
      title: "No cumplió expectativas",
      comment: "Esperaba más por el precio que pagué. La calidad es inferior a lo que muestran las imágenes.",
      rating: 2,
      verified: true,
    },
    {
      id: 95,
      name: "Laia S.",
      date: "10 Feb 2022",
      title: "Excelente compra",
      comment: "Muy satisfecha con mi compra. El producto es de gran calidad y el servicio impecable.",
      rating: 5,
      verified: false,
    },
    {
      id: 96,
      name: "Biel M.",
      date: "5 Feb 2022",
      title: "Buen producto",
      comment: "Cumple con lo que promete. La relación calidad-precio es muy buena.",
      rating: 4,
      verified: true,
    },
    {
      id: 97,
      name: "Noa L.",
      date: "31 Ene 2022",
      title: "No lo recomendaría",
      comment: "Mala calidad y pésimo servicio al cliente. No responden a las reclamaciones.",
      rating: 1,
      verified: true,
    },
    {
      id: 98,
      name: "Marc P.",
      date: "28 Ene 2022",
      title: "Muy bueno",
      comment: "Excelente producto a un precio razonable. Muy satisfecho con mi compra.",
      rating: 5,
      verified: true,
    },
    {
      id: 99,
      name: "Aina G.",
      date: "25 Ene 2022",
      title: "Buena relación calidad-precio",
      comment: "No es el más barato, pero la calidad justifica el precio. Recomendable.",
      rating: 4,
      verified: false,
    },
    {
      id: 100,
      name: "Jan R.",
      date: "20 Ene 2022",
      title: "Excelente",
      comment: "Uno de los mejores productos que he comprado. Calidad excepcional y muy fácil de usar.",
      rating: 5,
      verified: true,
    },
  ]

  const [commentsToShow, setCommentsToShow] = useState<typeof randomComments>([]);
  const [numComments, setNumComments] = useState(3);

  useEffect(() => {
    // Función para actualizar el número de comentarios según el ancho de pantalla
    function updateNumComments() {
      if (window.innerWidth >= 1024) {
        setNumComments(7); // lg o mayor
      } else if (window.innerWidth >= 768) {
        setNumComments(4); // md
      } else {
        setNumComments(3); // móvil
      }
    }
    updateNumComments();
    window.addEventListener('resize', updateNumComments);
    return () => window.removeEventListener('resize', updateNumComments);
  }, []);

  useEffect(() => {
    setCommentsToShow(getRandomComments(randomComments, numComments));
  }, [numComments]);

  function getRandomComments<T>(array: T[], count: number): T[] {
    const shuffled = array.slice().sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  return (
    <div className="w-full py-4 px-2 md:px-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-2">Opiniones de clientes</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(Number(averageRating)) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="font-medium">{averageRating.toFixed(1)} de 5</span>
          <span className="text-sm text-muted-foreground">({randomComments.length} valoraciones)</span>
        </div>
      </div>

      <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-7 md:gap-4">
        {commentsToShow.map((comment) => (
          <Card key={comment.id} className="overflow-hidden border-gray-200">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < comment.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  {comment.verified && (
                    <Badge
                      variant="outline"
                      className="text-xs font-normal text-green-600 bg-green-50 border-green-200 rounded-sm px-1 py-0 h-auto"
                    >
                      Compra verificada
                    </Badge>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-sm">{comment.title}</h3>
                </div>

                <div className="flex items-center text-xs text-muted-foreground">
                  <span>{comment.name}</span>
                  <span className="mx-1">•</span>
                  <span>{comment.date}</span>
                </div>

                <p className="text-sm text-muted-foreground">{comment.comment}</p>

                <div className="flex items-center gap-4 pt-1">
                  <button className="text-xs text-muted-foreground flex items-center gap-1 hover:text-gray-700">
                    <span>¿Te ha parecido útil?</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
