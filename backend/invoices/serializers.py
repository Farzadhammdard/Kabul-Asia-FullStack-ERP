from rest_framework import serializers
from django.db import transaction
from .models import Invoice, InvoiceItem


class InvoiceItemSerializer(serializers.ModelSerializer):
    total_price = serializers.ReadOnlyField()
    service_name = serializers.CharField(source="service.name", read_only=True)

    class Meta:
        model = InvoiceItem
        fields = '__all__'


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)
    total_amount = serializers.ReadOnlyField()

    class Meta:
        model = Invoice
        fields = '__all__'


class InvoiceItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ['service', 'quantity', 'price']


class InvoiceCreateSerializer(serializers.ModelSerializer):
    items = InvoiceItemCreateSerializer(many=True, required=False)

    class Meta:
        model = Invoice
        fields = ['customer_name', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])

        with transaction.atomic():
            invoice = Invoice.objects.create(**validated_data)
            for item in items_data:
                InvoiceItem.objects.create(
                    invoice=invoice,
                    **item
                )
        return invoice


class InvoiceUpdateSerializer(serializers.ModelSerializer):
    items = InvoiceItemCreateSerializer(many=True, required=False)

    class Meta:
        model = Invoice
        fields = ['customer_name', 'items']

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        instance.customer_name = validated_data.get('customer_name', instance.customer_name)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for item in items_data:
                InvoiceItem.objects.create(invoice=instance, **item)

        return instance
