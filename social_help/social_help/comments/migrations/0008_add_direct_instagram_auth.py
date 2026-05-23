from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('comments', '0007_alter_comment_id_alter_instagramaccount_id_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='instagramaccount',
            name='auth_method',
            field=models.CharField(choices=[('facebook_oauth', 'Facebook OAuth'), ('direct_token', 'Direct Token')], default='facebook_oauth', max_length=20),
        ),
        migrations.AlterField(
            model_name='instagramaccount',
            name='page_id',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
