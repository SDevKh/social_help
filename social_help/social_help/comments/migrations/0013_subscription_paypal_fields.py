from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("comments", "0012_subscription"),
    ]

    operations = [
        migrations.AddField(
            model_name="subscription",
            name="payment_provider",
            field=models.CharField(blank=True, default="", max_length=30),
        ),
        migrations.AddField(
            model_name="subscription",
            name="paypal_order_id",
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name="subscription",
            name="paypal_capture_id",
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
